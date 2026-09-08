import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OrdersPdfService {
  constructor(private prisma: PrismaService) {}

  private async fetchImageBuffer(url: string): Promise<Buffer | null> {
    try {
      if (url.startsWith('http')) {
        const response = await fetch(url);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } else {
        const localPath = path.join(process.cwd(), 'public', url);
        if (fs.existsSync(localPath)) return fs.readFileSync(localPath);
        const uploadPath = path.join(process.cwd(), url);
        if (fs.existsSync(uploadPath)) return fs.readFileSync(uploadPath);
      }
    } catch (e) {
      console.error('Failed to load image:', e);
    }
    return null;
  }

  async generateInvoice(orderId: number, res: any): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const settings = await this.prisma.systemSetting.findFirst();
    const companyName = settings?.companyName || 'Capolista Apparel';
    const address = settings?.address || 'Jl. Contoh No. 123, Kota';
    const invoiceNote = settings?.invoiceNote || 'Terima kasih atas pesanan Anda.';
    const bankAccount = settings?.bankAccount || 'Belum ada informasi rekening.';
    const logoBuffer = settings?.logoUrl ? await this.fetchImageBuffer(settings.logoUrl) : null;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Invoice-${order.noOrder}.pdf`);
    doc.pipe(res);

    this.generateHeader(doc, companyName, address, 'I N V O I C E', logoBuffer);
    this.generateCustomerInformation(doc, order);
    this.generateInvoiceTable(doc, order);
    this.generatePaymentInfoAndFooter(doc, bankAccount, invoiceNote);

    doc.end();
  }

  async generateReceipt(orderId: number, res: any, paymentId?: number): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, pembayaran: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const settings = await this.prisma.systemSetting.findFirst();
    const companyName = settings?.companyName || 'Capolista Apparel';
    const address = settings?.address || 'Jl. Contoh No. 123, Kota';
    const receiptNote = settings?.receiptNote || 'Bukti pembayaran sah.';
    const logoBuffer = settings?.logoUrl ? await this.fetchImageBuffer(settings.logoUrl) : null;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Kwitansi-${order.noOrder}${paymentId ? `-${paymentId}` : ''}.pdf`);
    doc.pipe(res);

    this.generateHeader(doc, companyName, address, 'K W I T A N S I', logoBuffer);
    this.generateReceiptDetails(doc, order, paymentId);
    this.generateFooter(doc, receiptNote);

    doc.end();
  }

  private generateHeader(doc: PDFKit.PDFDocument, companyName: string, address: string, title: string, logoBuffer: Buffer | null) {
    const ACCENT_COLOR = '#1E3A8A';
    
    // Top colored bar
    doc.rect(0, 0, 595, 10).fill(ACCENT_COLOR);

    let textStartX = 50;
    if (logoBuffer) {
      try {
        doc.image(logoBuffer, 50, 35, { width: 55 });
        textStartX = 120;
      } catch (e) {
        console.error('Error drawing image', e);
      }
    }

    doc
      .fillColor(ACCENT_COLOR)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(companyName, textStartX, 40)
      .fillColor('#6B7280')
      .fontSize(9)
      .font('Helvetica')
      .text(address, textStartX, 68, { width: 250 })
      
      .fillColor('#9CA3AF')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(title, 200, 40, { align: 'right', width: 345 })
      .moveDown();
      
    doc.strokeColor('#E5E7EB').lineWidth(2).moveTo(50, 110).lineTo(545, 110).stroke();
  }

  private generateCustomerInformation(doc: PDFKit.PDFDocument, order: any) {
    const top = 135;
    const TEXT_DARK = '#1F2937';
    const TEXT_LIGHT = '#6B7280';
    
    // Info Box Left
    doc.roundedRect(50, top - 10, 230, 85, 8).fill('#F9FAFB').stroke('#E5E7EB');
    doc.fillColor(TEXT_LIGHT).fontSize(9).font('Helvetica-Bold').text(`Nomor Order:`, 65, top)
       .fillColor(TEXT_DARK).font('Helvetica').text(order.noOrder, 150, top)
       .fillColor(TEXT_LIGHT).font('Helvetica-Bold').text(`Tanggal Order:`, 65, top + 20)
       .fillColor(TEXT_DARK).font('Helvetica').text(order.tanggalOrder.toLocaleDateString('id-ID'), 150, top + 20);

    const isLunas = Number(order.sisaBayar) <= 0;
    const badgeColor = isLunas ? '#10B981' : '#F59E0B'; // Green vs Yellow
    const badgeText = isLunas ? 'LUNAS' : 'BELUM LUNAS';
    doc.roundedRect(65, top + 45, 80, 20, 4).fill(badgeColor);
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold').text(badgeText, 65, top + 50, { width: 80, align: 'center' });
      
    // Info Box Right (Bill To)
    doc.roundedRect(300, top - 10, 245, 85, 8).fill('#FFFFFF').stroke('#E5E7EB');
    doc.fillColor(TEXT_LIGHT).fontSize(9).font('Helvetica-Bold').text(`Kepada Yth:`, 315, top)
       .fillColor(TEXT_DARK).font('Helvetica-Bold').fontSize(11).text(order.customer?.nama || '-', 315, top + 15)
       .font('Helvetica').fontSize(9).text(order.customer?.alamat || '-', 315, top + 32, { width: 215, height: 25 })
       .text(order.customer?.kontak || '-', 315, top + 55);
  }
  
  private generateReceiptDetails(doc: PDFKit.PDFDocument, order: any, paymentId?: number) {
    const top = 135;
    const TEXT_DARK = '#1F2937';
    const TEXT_LIGHT = '#6B7280';
    
    // Receipt Summary Box
    doc.roundedRect(50, top, 495, 85, 8).fill('#F8FAFC').stroke('#E2E8F0');
       
    doc.fillColor(TEXT_DARK);
    
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`Nomor Order:`, 70, top + 15)
      .font('Helvetica')
      .text(order.noOrder, 170, top + 15)
      .font('Helvetica-Bold')
      .text(`Nama Pelanggan:`, 70, top + 35)
      .font('Helvetica')
      .text(order.customer?.nama || '-', 170, top + 35)
      
      .font('Helvetica-Bold')
      .text(`Total Tagihan:`, 300, top + 15)
      .font('Helvetica')
      .text(`Rp ${Number(order.totalHarga).toLocaleString('id-ID')}`, 410, top + 15, { align: 'right', width: 110 })
      .font('Helvetica-Bold')
      .text(`Total Terbayar:`, 300, top + 35)
      .font('Helvetica')
      .text(`Rp ${Number(order.dp).toLocaleString('id-ID')}`, 410, top + 35, { align: 'right', width: 110 })
      .font('Helvetica-Bold')
      .text(`Sisa Pembayaran:`, 300, top + 55)
      .font('Helvetica')
      .text(`Rp ${Number(order.sisaBayar).toLocaleString('id-ID')}`, 410, top + 55, { align: 'right', width: 110 });

    let currentY = top + 120;
    
    const isSpecificPayment = !!paymentId;
    doc.fillColor('#1E3A8A').fontSize(13).font('Helvetica-Bold').text(isSpecificPayment ? 'Detail Pembayaran Ini' : 'Riwayat Pembayaran', 50, currentY);
    currentY += 25;
    
    let paymentsToDisplay = order.pembayaran || [];
    if (isSpecificPayment) {
      paymentsToDisplay = paymentsToDisplay.filter((p: any) => p.id === paymentId);
    }

    if (paymentsToDisplay.length > 0) {
      doc.roundedRect(50, currentY, 495, 25, 4).fill('#F1F5F9');
      doc.fillColor('#334155').font('Helvetica-Bold').fontSize(10);
      doc.text('Tanggal', 65, currentY + 7);
      doc.text('Metode Pembayaran', 200, currentY + 7);
      doc.text('Jumlah', 440, currentY + 7, { width: 90, align: 'right' });
      currentY += 30;
      
      doc.fillColor(TEXT_DARK).font('Helvetica');
      for (let i = 0; i < paymentsToDisplay.length; i++) {
        const p = paymentsToDisplay[i];
        
        doc.text(p.tanggalBayar.toLocaleDateString('id-ID'), 65, currentY);
        doc.text(p.metodePembayaran, 200, currentY);
        doc.font('Helvetica-Bold').text(`Rp ${Number(p.jumlah).toLocaleString('id-ID')}`, 440, currentY, { width: 90, align: 'right' }).font('Helvetica');
        currentY += 20;
        doc.strokeColor('#F1F5F9').lineWidth(1).moveTo(50, currentY).lineTo(545, currentY).stroke();
        currentY += 10;
      }
    } else {
      doc.roundedRect(50, currentY, 495, 50, 8).fill('#FEF2F2').stroke('#FECACA');
      doc.fillColor('#EF4444').font('Helvetica').text(isSpecificPayment ? 'Data pembayaran tidak ditemukan.' : 'Belum ada riwayat pembayaran yang tercatat untuk order ini.', 50, currentY + 20, { align: 'center', width: 495 });
      currentY += 60;
    }

    // Signature Box
    const signY = currentY < 600 ? 600 : currentY + 50;
    doc.fillColor('#1F2937').fontSize(10).font('Helvetica').text('Penerima,', 400, signY, { align: 'center', width: 120 });
    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(400, signY + 55).lineTo(520, signY + 55).stroke();
    doc.fillColor('#6B7280').fontSize(9).text('( Capolista Apparel )', 400, signY + 60, { align: 'center', width: 120 });
  }

  private generateInvoiceTable(doc: PDFKit.PDFDocument, order: any) {
    let i = 0;
    const invoiceTableTop = 245;
    const TEXT_DARK = '#1F2937';

    doc.roundedRect(50, invoiceTableTop, 495, 25, 4).fill('#1E3A8A');
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);
    this.generateTableRow(doc, invoiceTableTop + 7, 'Item Produksi', 'Ukuran', 'Jumlah', 'Harga Satuan', 'Total');
    
    let position = invoiceTableTop + 35;
    doc.fillColor(TEXT_DARK).font('Helvetica');

    for (i = 0; i < (order.items?.length || 0); i++) {
      const item = order.items[i];
      this.generateTableRow(doc, position, item.jenisProduk, item.ukuran, `${item.jumlahPcs} pcs`, '-', '-');
      position += 18;
      doc.strokeColor('#F3F4F6').lineWidth(1).moveTo(50, position).lineTo(545, position).stroke();
      position += 12;
    }

    const subtotalPosition = position + 10;
    doc.roundedRect(300, subtotalPosition - 10, 245, 80, 8).fill('#F8FAFC').stroke('#E2E8F0');

    doc.fillColor('#475569').font('Helvetica-Bold').fontSize(10);
    doc.text('Total Harga:', 315, subtotalPosition);
    doc.fillColor('#1E293B').text(`Rp ${Number(order.totalHarga).toLocaleString('id-ID')}`, 410, subtotalPosition, { align: 'right', width: 120 });
    
    doc.fillColor('#475569');
    doc.text('Sudah Dibayar (DP):', 315, subtotalPosition + 22);
    doc.fillColor('#10B981').text(`Rp ${Number(order.dp).toLocaleString('id-ID')}`, 410, subtotalPosition + 22, { align: 'right', width: 120 });
    
    doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(315, subtotalPosition + 40).lineTo(530, subtotalPosition + 40).stroke();

    doc.fillColor('#475569');
    doc.text('Sisa Bayar:', 315, subtotalPosition + 50);
    doc.fillColor('#EF4444').fontSize(12).text(`Rp ${Number(order.sisaBayar).toLocaleString('id-ID')}`, 410, subtotalPosition + 49, { align: 'right', width: 120 });
    
    doc.fillColor(TEXT_DARK);
  }

  private generateTableRow(doc: PDFKit.PDFDocument, y: number, item: string, size: string, qty: string, unitCost: string, lineTotal: string) {
    doc.text(item, 65, y, { width: 150 })
       .text(size, 215, y, { width: 60 })
       .text(qty, 275, y, { width: 60, align: 'center' })
       .text(unitCost, 350, y, { width: 90, align: 'right' })
       .text(lineTotal, 440, y, { width: 90, align: 'right' });
  }

  private generatePaymentInfoAndFooter(doc: PDFKit.PDFDocument, bankAccount: string, note: string) {
    const startY = doc.y > 600 ? 600 : doc.y + 110; 
    
    // Left: Payment Info
    doc.roundedRect(50, startY, 230, 80, 8).fill('#F0F9FF').stroke('#BAE6FD'); 
    doc.fillColor('#0284C7').fontSize(10).font('Helvetica-Bold').text('Informasi Pembayaran', 65, startY + 15);
    doc.fillColor('#0C4A6E').font('Helvetica').fontSize(9).text(bankAccount, 65, startY + 32, { width: 200, lineGap: 4 });

    // Right: Signature Box
    doc.fillColor('#1F2937').fontSize(10).font('Helvetica').text('Hormat Kami,', 400, startY + 15, { align: 'center', width: 120 });
    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(400, startY + 70).lineTo(520, startY + 70).stroke();
    doc.fillColor('#6B7280').fontSize(9).text('( Capolista Apparel )', 400, startY + 75, { align: 'center', width: 120 });

    this.generateFooter(doc, note);
  }

  private generateFooter(doc: PDFKit.PDFDocument, note: string) {
    doc.fillColor('#9CA3AF').fontSize(9).font('Helvetica-Oblique').text(note, 50, 770, { align: 'center', width: 495 });
  }
}
