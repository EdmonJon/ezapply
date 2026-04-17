// Components
import PasswordResetLinkController from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import EzNav from "../Landing/ezapply-nav";

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import "../../../css/easyApply.css";

export default function ForgotPassword({ status }: { status?: string }) {
    return (
                <div className="login-background relative min-h-screen flex flex-col">
                    <EzNav />
                {/* <div className="flex justify-center">
                <h1 className="text-5xl font-extrabold text-green-950 tracking-wide drop-shadow-md relative z-10 mt-6">
                <span className="bg-gradient-to-r from-green-950 via-blue-600 to-blue-300 bg-clip-text text-transparent wave-text">
                    EZ Apply
                </span>
                </h1>
            </div> */}
            
        {/* <div className="relative  flex items-center justify-center"> */}
            <div className="w-full md:w-auto flex items-center justify-center">
            <div className="glass-card p-8 w-full max-w-md">

            <div className="relative mx-4 -mt-6 mb-4 flex h-24 items-center justify-center rounded-xl Ezezez shadow-md">
            <h1 className="text-3xl font-semibold tracking-tight">EZ Apply</h1>
            </div>
        <AuthLayout title="Forgot password" description="Enter your email to receive a password reset link">
            <Head title="Forgot password" />

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <div className="space-y-6">
                <Form {...PasswordResetLinkController.store.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input id="email" type="email" name="email" autoComplete="off" autoFocus placeholder="email@example.com" />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button className="w-full bg-gradient-to-tr from-blue-900 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all" disabled={processing}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Email password reset link
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Or, return to</span>
                    <TextLink href={login()} tabIndex={5} className="text-blue-600 hover:text-blue-800 font-medium">log in</TextLink>
                </div>
            </div>
        </AuthLayout>
        </div>
        </div>
        </div>
        // </div>
    );
}
