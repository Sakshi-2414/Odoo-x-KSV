import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import createSupabaseServer from '../../../../lib/supabase/server';

const supabase = createSupabaseServer();

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const poId = body.po_id || body.purchase_order_id;
		if (!poId) {
			return NextResponse.json({ error: 'po_id is required' }, { status: 400 });
		}

		const { data, error } = await supabase.from('purchase_orders').select('*').eq('id', poId).single();
		if (error || !data) {
			return NextResponse.json({ error: error?.message || 'Purchase order not found' }, { status: 404 });
		}

		const pdf = new jsPDF();
		pdf.setFontSize(18);
		pdf.text(`Purchase Order ${data.po_number || data.id}`, 14, 18);
		pdf.setFontSize(11);
		pdf.text(`Vendor: ${data.vendor_id || 'N/A'}`, 14, 30);
		pdf.text(`Currency: ${data.currency || 'USD'}`, 14, 38);
		pdf.text(`Total: ${data.total_amount}`, 14, 46);
		pdf.text(`Status: ${data.status || 'issued'}`, 14, 54);

		let y = 70;
		for (const item of Array.isArray(data.line_items) ? data.line_items : []) {
			pdf.text(`- ${item.description || item.name || 'Line item'} x ${item.qty || 1} @ ${item.unit_price ?? ''}`, 14, y);
			y += 8;
			if (y > 270) {
				pdf.addPage();
				y = 20;
			}
		}

		const pdfDataUri = pdf.output('datauristring');
		await supabase.from('purchase_orders').update({ pdf_url: pdfDataUri }).eq('id', poId);

		return NextResponse.json({
			po_id: poId,
			po_number: data.po_number,
			pdf_url: pdfDataUri,
		});
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}

