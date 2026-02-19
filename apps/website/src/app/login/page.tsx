import { redirect } from 'next/navigation';

export default function LoginPage() {
    redirect('/?auth=google&flow=login');
}
