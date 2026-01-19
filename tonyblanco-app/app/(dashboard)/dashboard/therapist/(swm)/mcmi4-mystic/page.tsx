'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Mcmi4MysticPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/therapist/swm/mcmi4');
    }, [router]);

    return null;
}
