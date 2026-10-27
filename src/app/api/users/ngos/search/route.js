import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const domain = searchParams.get('domain');

    const snapshot = await db.collection('users').where('role', '==', 'ngo').get();

    let ngos = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const publicData = {
        _id: doc.id,
        gcId: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        profilePhoto: data.profilePhoto,
        ngoDarpanId: data.ngoDarpanId,
        headquarters: data.headquarters,
        website: data.website,
        domain: data.domain,
        about: data.about,
        mediaGallery: data.mediaGallery,
        pocName: data.pocName,
        pocDesignation: data.pocDesignation,
        createdAt: data.createdAt
      };
      ngos.push(publicData);
    });

    if (location) {
      const locRegex = new RegExp(location, 'i');
      ngos = ngos.filter(ngo => ngo.headquarters && locRegex.test(ngo.headquarters));
    }

    if (domain) {
      const domRegex = new RegExp(domain, 'i');
      ngos = ngos.filter(ngo => ngo.domain && domRegex.test(ngo.domain));
    }

    ngos.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    return NextResponse.json(ngos, { status: 200 });
  } catch (error) {
    console.error('Error searching NGOs:', error);
    return NextResponse.json({ error: 'Server error while searching NGOs' }, { status: 500 });
  }
}
