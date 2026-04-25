import { Request, Response } from 'express';
import Room from '../models/Room';

type StatusTone = 'green' | 'blue' | 'orange' | 'purple';

interface FloorSeed {
	id: string;
	title: string;
	about: string;
	facilities: string[];
	monthlyFeeRange: {
		min: number;
		max: number;
	};
	totalRooms: number;
	availableRooms: number;
	statusBadge: string;
	statusTone: StatusTone;
}

const FLOOR_SEEDS: Record<string, FloorSeed> = {
	'1st-floor': {
		id: '1st-floor',
		title: '1st Floor',
		about:
			'The 1st floor is designed for budget-friendly accommodation with essential facilities. It is suitable for students who prefer convenient access, affordable monthly rent, and easy movement.',
		facilities: [
			'Ceiling Fan',
			'Standard Bed',
			'Shared / Attached Bathroom',
			'WiFi Access',
			'Laundry Access',
			'Secure Rooms',
		],
		monthlyFeeRange: { min: 8000, max: 9000 },
		totalRooms: 8,
		availableRooms: 6,
		statusBadge: 'Popular Floor',
		statusTone: 'blue',
	},
	'2nd-floor': {
		id: '2nd-floor',
		title: '2nd Floor',
		about:
			'The 2nd floor offers improved comfort with better ventilation and a quieter environment. Ideal for students seeking balanced comfort.',
		facilities: [
			'Ceiling Fan',
			'Stand Fan',
			'Furnished Room',
			'WiFi Access',
			'Bathroom Facility',
			'Secure Rooms',
		],
		monthlyFeeRange: { min: 10000, max: 11000 },
		totalRooms: 8,
		availableRooms: 5,
		statusBadge: 'Limited Rooms Available',
		statusTone: 'orange',
	},
	'3rd-floor': {
		id: '3rd-floor',
		title: '3rd Floor',
		about:
			'The 3rd floor provides comfortable air-conditioned rooms with added privacy and modern facilities. Suitable for long-term residents and peaceful study space.',
		facilities: [
			'Air Conditioner',
			'Ceiling Fan Backup',
			'Premium Bed',
			'Attached Bathroom',
			'High-Speed WiFi',
			'Secure Rooms',
		],
		monthlyFeeRange: { min: 15000, max: 17000 },
		totalRooms: 8,
		availableRooms: 7,
		statusBadge: 'Best for Study',
		statusTone: 'green',
	},
	'4th-floor': {
		id: '4th-floor',
		title: '4th Floor',
		about:
			'The 4th floor is the premium accommodation level with spacious AC rooms, peaceful atmosphere, and better privacy. Best for premium student stays.',
		facilities: [
			'Air Conditioner',
			'Deluxe Bed',
			'Private Bathroom',
			'High-Speed WiFi',
			'Balcony / View',
			'Secure Rooms',
		],
		monthlyFeeRange: { min: 18000, max: 20000 },
		totalRooms: 8,
		availableRooms: 5,
		statusBadge: 'Premium Floor',
		statusTone: 'purple',
	},
};

const normalizeFloorParam = (raw: string): string | null => {
	const value = String(raw || '').trim().toLowerCase();
	if (!value) return null;

	if (value === '1' || value.includes('1st') || value.includes('first')) return '1st-floor';
	if (value === '2' || value.includes('2nd') || value.includes('second')) return '2nd-floor';
	if (value === '3' || value.includes('3rd') || value.includes('third')) return '3rd-floor';
	if (value === '4' || value.includes('4th') || value.includes('fourth')) return '4th-floor';

	const floorDigitMatch = value.match(/(^|[^\d])([1-4])($|[^\d])/);
	const floorDigit = floorDigitMatch?.[2];
	if (floorDigit === '1') return '1st-floor';
	if (floorDigit === '2') return '2nd-floor';
	if (floorDigit === '3') return '3rd-floor';
	if (floorDigit === '4') return '4th-floor';

	return null;
};

const floorLabelFromCanonical = (id: string): string => {
	if (id === '1st-floor') return '1st Floor';
	if (id === '2nd-floor') return '2nd Floor';
	if (id === '3rd-floor') return '3rd Floor';
	return '4th Floor';
};

export const getFloorDetails = async (req: Request, res: Response) => {
	try {
		const floorIdParam = Array.isArray(req.params.floorId) ? req.params.floorId[0] : req.params.floorId;
		const canonicalFloorId = normalizeFloorParam(floorIdParam);
		if (!canonicalFloorId) {
			return res.status(404).json({
				success: false,
				message: 'Floor not found',
			});
		}

		const seed = FLOOR_SEEDS[canonicalFloorId];
		const floorLabel = floorLabelFromCanonical(canonicalFloorId);
		const rooms = await Room.find({ floor: floorLabel })
			.select('price status occupied capacity image')
			.lean();

		const totalRooms = rooms.length > 0 ? rooms.length : seed.totalRooms;
		const availableRooms = rooms.length > 0
			? rooms.filter((r) => r.status !== 'Maintenance' && Number(r.capacity || 0) > Number(r.occupied || 0)).length
			: seed.availableRooms;

		const prices = rooms
			.map((r) => Number(r.price || 0))
			.filter((price) => Number.isFinite(price) && price > 0);

		const minFee = prices.length > 0 ? Math.min(...prices) : seed.monthlyFeeRange.min;
		const maxFee = prices.length > 0 ? Math.max(...prices) : seed.monthlyFeeRange.max;
		const heroImage = rooms.find((r) => typeof r.image === 'string' && r.image.trim())?.image || null;

		return res.json({
			success: true,
			data: {
				id: seed.id,
				routeId: req.params.floorId,
				title: seed.title,
				about: seed.about,
				facilities: seed.facilities,
				monthlyFeeRange: {
					min: minFee,
					max: maxFee,
				},
				totalRooms,
				availableRooms,
				statusBadge: seed.statusBadge,
				statusTone: seed.statusTone,
				location: 'Jaffna, Sri Lanka',
				image: heroImage,
			},
		});
	} catch (error: any) {
		return res.status(500).json({
			success: false,
			message: 'Error fetching floor details',
			error: error.message,
		});
	}
};

