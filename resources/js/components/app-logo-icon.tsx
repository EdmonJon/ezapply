import { SVGAttributes } from 'react';
import ezAppLogo from '../../../public/ezapply_logo.png';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img 
            src={ezAppLogo} 
            alt="EZApply Logo" 
            {...props as any} 
        />
    );
}