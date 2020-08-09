

export class Utils {
    static getQueryparam(param: string): string | undefined {
        const queryParams = (window.location.href.split('?')[1] || '').split('&').map(p => p.split('='));
        return (queryParams.find(p => p[0] === param) || [])[1];
    }

    static getRoute(subRoute: string) {
        let base = window.location.href.split('?')[0];
        if (!base.endsWith('/')) {
            base = base + '/';
        }
        return base + subRoute;
    }

    static platform(): 'desktop' | 'iOS' | 'android' {
        var iOs = /Phone|iPad|iPod/i.test(navigator.userAgent);
        var android = /Android/i.test(navigator.userAgent);
        if (iOs) { return 'iOS'; };
        if (android) { return 'android'; };
        return 'desktop';
    }

    static shorten(s: string) {
        if (s.length <= 25) { return s; }
        return `${s.substr(0, 10)}...${s.substr(s.length - 10)}`;
    }

    static linkForAddress(network: string, addr: string) {
        return  (network === 'RINKEBY') ?
            `https://rinkeby.etherscan.io/address/${addr}` :
            `https://etherscan.io/address/${addr}`;
    }

    static linkForTransaction(network: string, tid: string) {
        return  (network === 'RINKEBY') ?
            `https://rinkeby.etherscan.io/tx/${tid}` :
            `https://etherscan.io/tx/${tid}`;
    }

    static validateMultipleEmails (emailInput: any) {
        // Get value on emails input as a string
        let emails = emailInput;
        
        // Split string by comma into an array
        emails = emails.split(",");
    
        const valid = true;
        const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
        const invalidEmails = [];
        const validEmails = [];
        
        for (var i = 0; i < emails.length; i++) {
            // Trim whitespaces from email address
            emails[i] = emails[i].trim();
            
            // Check email against our regex to determine if email is valid
            if( emails[i] == "" || ! regex.test(emails[i])){
                invalidEmails.push(emails[i]);
            }else{
                validEmails.push(emails[i])
            }
        }
        return {emails,invalidEmails,validEmails};
    }     
}