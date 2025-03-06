"use client"
import { deleteInvoice, getInvoiceById, updateInvoice } from '@/app/actions'
import React, { useEffect, useState } from 'react'
import {Invoice, Totals} from '@/type'
import Wrapper from '@/app/components/Wrapper'
import { Save, Trash } from 'lucide-react'
import InvoiceInfo from '@/app/components/Invoiceinfo'
import VATControl from '@/app/components/VATControl'
import InvoiceLines from '@/app/components/InvoiceLines'
import { useRouter } from 'next/navigation'
import InvoicePDF from '@/app/components/InvoicePDF'

const page = ({params}: {params:Promise <{invoiceId: string}>}) => {

  const [invoice, setInvoice] = useState<Invoice | null >(null);
  const [initialInvoice, setInitialInvoice] = useState<Invoice | null >(null);
  const [totals, setTotals] = useState<Totals | null >(null)
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsloading] = useState(false);
  const router = useRouter();

  const fetchInvoice = async () =>{
    try {
      const {invoiceId} = await params
      const fetchedInvoice = await getInvoiceById(invoiceId)
      if (fetchedInvoice) {
        setInvoice(fetchedInvoice)
        setInitialInvoice(fetchedInvoice)
      }
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() =>{
    fetchInvoice()
  }, [])
  
  useEffect(() =>{
    if (!invoice) return;
    const ht = invoice?.lines.reduce((acc, {quantity, unitPrice}) =>
        acc + quantity * unitPrice, 0
    )
    const vat = invoice.vatActive ? ht * (invoice.vatRate/100) : 0
    setTotals({totalHT: ht, totalVAT: vat, totalTTC: ht + vat})
  }, [invoice])
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = parseInt(e.target.value)
    if (invoice) {
      const updatedInvoice = {...invoice, status: newStatus}
      setInvoice(updatedInvoice)
    }
  }

  useEffect(() =>{
    setIsSaveDisabled(
      JSON.stringify(invoice) === JSON.stringify(initialInvoice)
    )
  }, [invoice, initialInvoice])

  const handleSave = async () =>{
    if(!invoice) return;
    setIsloading(true)
    try {
      await updateInvoice(invoice)
      const updatedInvoice = await getInvoiceById(invoice.id)
      if (updatedInvoice) {
        setInvoice(updatedInvoice)
        setInitialInvoice(updatedInvoice)
      }
      setIsloading(false)

    } catch (error) {
      console.error("Erreur lors de la sauvegarde de votre facture :", error);
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Etes vous sur de vouloir supprimer cette facture ?')
    if (confirmed) {
      try {
        await deleteInvoice(invoice?.id as string)
        router.push('/')
      } catch (error) {
        console.error("Erreur lors de la suppression de la facture.", error);
        
      }
    }
  }


  if (!invoice || !totals) return (
  
    <div className="flex justify-center items-center h-screen w-full">
    <span className='font-bold'>Facture Non Trouver</span>
    </div>
  )

  
  return (
    <Wrapper>

    <div>
        <div className= "flex flex-col md:flex-row md:justify-between mb-3.5">
          <p className='badge badge-ghost badge-lg uppercase'>
            <span>Facture-</span>{invoice?.id}
          </p>
        <div className="flex md:mt-0 mt-4">
          <select
           value={invoice?.status} 
           className="select select-sm select-bordered w-full"
           onChange={handleStatusChange}
           >
            <option value={1}>Bouillon</option>
            <option value={2}>En attente</option>
            <option value={3}>Payée</option>
            <option value={4}>Annulée</option>
            <option value={5}>Impayée</option>
          </select>
        <button 
          className='btn btn-sm btn-accent ml-4'
          disabled={isSaveDisabled  || isLoading}
          onClick={handleSave}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ):(
              <>
                Sauvegarder
                <Save className="w-4 ml-2"/>
              </>
            )

            }
        </button>
        <button
          onClick={handleDelete}
          className="btn btn-sm btn-accent ml-4">
          <Trash className="w-4"/>
        </button>
        </div>
        </div>

        <div className='flex flex-col md:flex-row x-full'>
          <div className='flex w-full md:w-1/3 flex-col'>
          <div className='mb-4 bg-base-200 rounded-xl p-5'>
            <div className='flex justify-between items-center mb-4'>
              <div className="badge badge-accent">Résumé des totaux</div>
              <VATControl invoice={invoice} setInvoice={setInvoice}/>
            </div>
            <div className='flex justify-between'>
              <span>Total Hors Taxes</span>
              <span>{totals.totalHT.toFixed(2)}F CFA</span>
            </div>
            <div className='flex justify-between'>
              <span>TVA ({invoice?.vatActive? `${invoice?.vatRate}`:'0' } %)</span>
              <span>{totals.totalVAT.toFixed(2)}F CFA</span>
            </div>
            <div className='flex justify-between font-bold'>
              <span>Total TTC</span>
              <span>{totals.totalTTC.toFixed(2)}F CFA</span>
            </div>
          </div>

          <InvoiceInfo invoice={invoice} setInvoice={setInvoice}/>

          </div>

          <div className='flex w-full md:w-2/3 flex-col md:ml-4'>
              <InvoiceLines invoice={invoice} setInvoice={setInvoice}/>
              <InvoicePDF invoice={invoice} totals={totals}/>
          </div>
        </div>

    </div>
    </Wrapper>
  )
}

export default page 