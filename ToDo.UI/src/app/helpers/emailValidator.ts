export default class EmailValidator{
    static checkValidEmail(email: string)
    {
        const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        let isValidEmail: boolean = false;
        isValidEmail = pattern.test(email);
        return isValidEmail;
    }
}