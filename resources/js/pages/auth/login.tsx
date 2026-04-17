import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import "../../../css/easyApply.css";
import AppLogoIcon from '../../components/app-logo-icon';
import EzNav from "../Landing/ezapply-nav";
 
interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}
 
export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <div className="login-background relative min-h-screen flex flex-col">
            <EzNav />  
     
      <div className="w-full md:w-auto flex items-center justify-center">
            <div className="glass-card p-8 w-full max-w-md">
 
            <Head title="Log in" />
            <div className="relative mx-4 -mt-4 flex h-24 items-center justify-center gap-2">
                <AppLogoIcon className="h-20 w-auto" />
               
            </div>
        <AuthLayout title="Log in to your account" description="">
            <Form {...AuthenticatedSessionController.store.form()} resetOnSuccess={['password']} className="flex flex-col gap-2" >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className="h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                                <InputError message={errors.email} />
                            </div>
 
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="********"
                                    className="h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                                <InputError message={errors.password} />
                            </div>
 
                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" tabIndex={3} className="accent-blue-600 ezapply-checkbox" />
                                <Label htmlFor="remember" className="text-sm text-gray-700">Remember me</Label>
                                {canResetPassword && (
                                        <TextLink href={request()} className="ml-auto text-sm text-blue-600 hover:text-blue-800" tabIndex={5}>
                                            Forgot password?
                                        </TextLink>
                                    )}
                            </div>
 
                            <Button type="submit" className="w-full bg-gradient-to-tr from-blue-900 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all " tabIndex={4} disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Log in
                            </Button>
                        </div>
 
                        <div className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <TextLink href={register()} tabIndex={5} className="text-blue-600 hover:text-blue-800 font-medium">
                                Sign up
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
 
            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
                                    </div>
                                    </div>
                                    </div>
    );
}
 