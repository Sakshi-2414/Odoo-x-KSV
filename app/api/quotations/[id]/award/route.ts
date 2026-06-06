import { NextResponse } from 'next/server';
import { awardQuotation } from '../../../../../features/procurement/quotation';

type RouteContext = {
	params: Promise<{
		id: string;
	}>;
};

export async function POST(request: Request, { params }: RouteContext) {
	try {
		const { id } = await params;
		
		// Directly award the quotation
		const result = await awardQuotation(id);

		return NextResponse.json(result);
	} catch (err: any) {
		console.error('Award quotation error:', err);
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}
