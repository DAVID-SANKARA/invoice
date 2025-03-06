import { Totals,Invoice } from '@/type'
import confetti from 'canvas-confetti'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { ArrowDownFromLine, PrinterCheck } from 'lucide-react'
import React, { useRef } from 'react'

interface FacturePDFProps {
    invoice: Invoice
    totals: Totals
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {day: '2-digit', month: 'short', year: 'numeric'};
    return date.toLocaleDateString('fr-FR', options);
}

const InvoicePDF: React.FC<FacturePDFProps>= ({invoice, totals}) => {
    const factureRef = useRef<HTMLDivElement>(null)
    const handleDownloadPdf = async () => {
        const element = factureRef.current
        if (element) {
            try {
                const canvas = await html2canvas(element ,{scale:3, useCORS:true})
                const imgData = canvas.toDataURL('image/png')

                const pdf = new jsPDF({
                    orientation: "portrait",
                    unit: 'mm',
                    format: "A4"
                })

                const pdfWidth = pdf.internal.pageSize.getWidth()
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                pdf.save(`facture-${invoice.name}.pdf`)

                confetti({
                        particleCount:150,
                        spread: 280,
                        origin: {y: 0.5},
                        zIndex: 9999999 
                })

            } catch (error) {
                console.error("Erreur lors de la génération du PDF:", error);
                
            }
        }
    }
  return (
    <div className='mt-4 hidden lg:block'>
        <div className="border-base-300 border-2
        border-dashed rounded-x1 p-5">
            
                <button 
                onClick={handleDownloadPdf}
                className="btn btn-sm btn-accent mb-4">
                    Facture PDF
                    <ArrowDownFromLine className='w-4'/>
                </button>
            
            <div className="p-8" ref={factureRef}>
                <div className="flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                        <div>
                            <div className="flex items-center">
                                <div className="bg-accent-content text-accent rounded-full p-2">
                                    <PrinterCheck className="h-6 w-6"/>
                                </div>
                                <span className='ml-3 font-bold text-2x1 italic'>
                                    In<span className="text-accent">Voice</span>
                                </span>
                            </div>
                        </div>
                        <h1 className="text-9x1 font-bold uppercase">Facture</h1>
                    </div>

                    <div className="text-right uppercase">
                        <p className="badge badge-ghost">
                            Facture °{invoice.id}
                        </p>
                        <p className="my-2">
                            <strong>Date </strong>
                            {formatDate(invoice.invoiceDate)}
                        </p>
                        <p className="my-2">
                            <strong>Date d'échéance </strong>
                            {formatDate(invoice.dueDate)}
                        </p>
                    </div>

                </div>
                <div className="my-6 flex justify-between">
                    <div>
                        <p className='badge badge-ghost mb-2'>Emetteur</p>
                        <p className='text-sm font-bold italic'>{invoice.issuerName}</p>
                        <p className='text-sm text-gray-500 w-52 break-words'>{invoice.issuerAddress}</p>
                    </div>
                    
                    <div className='text-right'>
                        <p className='badge badge-ghost mb-2'>Client</p>
                        <p className='text-sm font-bold italic'>{invoice.clientName}</p>
                        <p className='text-sm text-gray-500 w-52 break-words'>{invoice.clientAddress}</p>
                    </div>

                </div>
                <div className="overflow-x-auto">
                    <table className='table table-zebra'>
                        <thead>
                        <tr>
                            <th></th>
                            <th>Description</th>
                            <th>Quantité</th>
                            <th>Prix Unitaire</th>
                            <th>Total</th>
                        </tr>
                        </thead>
                        <tbody>
                            {invoice.lines.map((line, index) =>(
                                <tr key={index + 1}>
                                    <td>{index + 1}</td>
                                    <td>{line.description}</td>
                                    <td>{line.quantity}</td>
                                    <td>{line.unitPrice.toFixed(2)} F CFA</td>
                                    <td>{(line.quantity * line.unitPrice).toFixed(2)}F CFA</td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>

                <div className="mt-6 space-y-2 text-md">
                    <div className="flex justify-between">
                        <div className="font-bold">
                            Totals Hors Taxes
                        </div>
                        <div>
                            {totals.totalHT.toFixed(2)} F CFA
                        </div>
                    </div>
                    {invoice.vatActive && (
                        <div className="flex justify-between">
                            <div className="font-bold">
                                TVA {invoice.vatRate} %
                            </div>
                            <div>
                                {totals.totalVAT.toFixed(2)} F CFA
                            </div>
                        </div>
                    )}
                        <div className="flex justify-between">
                            <div className="font-bold">
                                Totals Toutes Taxes Comprises
                            </div>
                            <div className='badge badge-accent'>
                                {totals.totalTTC.toFixed(2)} F CFA
                            </div>
                        </div>

                    

                </div>
            </div>

        </div>
    </div>
)
}

export default InvoicePDF