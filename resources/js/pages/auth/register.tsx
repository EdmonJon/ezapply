// resources/js/Pages/Auth/Register.tsx
import { login } from '@/routes';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import '../../../css/easyApply.css';
import EzNav from "../Landing/ezapply-nav";
 
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import AppLogoIcon from '../../components/app-logo-icon';
 
 
type PSGCItem = { code: string; name: string };
interface RegisterProps {
roles: string[];
email: string;
password: string;
password_confirmation: string;
}
 
export default function Register({ roles }: { roles: string[] }) {
const { data, setData, post, processing, errors } = useForm({
    role: roles?.[1] || '',
    email: '',
    password: '',
    password_confirmation: '',
});
 
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register', {
            onSuccess: () => {
                console.log('Name:', data.email);
                console.log('Role:', data.role);
            },
            onError: (errors) => {
                console.log(errors);
            },
        });
    };
 
    return (
            <div className="login-background relative min-h-screen flex flex-col ">
            <EzNav />
             
            <div className="w-full md:w-auto flex items-center justify-center">
            <div className="glass-card p-8 w-full max-w-md mt-15">
 
            <Head title="Register" />
             <div className="relative mx-4 -mt-4 flex h-24 items-center justify-center gap-2">
            <AppLogoIcon className="h-20 w-auto" />
 
                </div>
        <AuthLayout title="Create an Account" description="">
 
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <div className="grid gap-2">
 
 
                    {/* Role */}
                    <div className="grid gap-2">
                        <Label htmlFor="role">Register as</Label>
                        <select
                            id="role"
                            name="role"
                            required
                            className="border rounded-md px-3 py-2 h-11 border-gray-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            value={(data as any).role}
                            onChange={(e) => setData('role' as any, e.target.value)}
                            tabIndex={3}
                        >
                            <option key={roles[1]} value={roles[1]}>
                                {roles[1]}
                            </option>
                            <option key={roles[0]} value={roles[0]}>
                                {roles[0]}
                            </option>
                        </select>
                        <InputError message={(errors as any).role} className="mt-2" />
                    </div>
 
                    {/* Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={4}
                            autoComplete="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                            className="h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                        <InputError message={errors.email} />
                    </div>
 
 
 
 
                    {/* Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={7}
                            autoComplete="new-password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            className="h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                        <InputError message={errors.password} />
                    </div>
 
                    {/* Confirm Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={8}
                            autoComplete="new-password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Confirm password"
                            className="ezapply-input"
                            />
                        <InputError message={errors.password_confirmation} />
                    </div>
                    {/* Submit Button */}
                    <Button type="submit" className="w-full bg-gradient-to-tr from-blue-900 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all" tabIndex={9}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>
 
                {/* Already have account */}
                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={login()} tabIndex={10} className="text-blue-600 hover:text-blue-800 font-medium">
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
                            </div>
                            </div>
                            </div>
                            // </div>
    );
}
 