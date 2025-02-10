// Created by Mahlon Kirwa

export class GlobalConstants {

    // messages to display when something goes wrong  
    public static genericError: string = 'Something went wrong. Please try again later.';

    public static productExistError: string = 'Product already exists.';

    public static productAdded: string = 'Product added successfully.';

    // Regex
    public static nameRegex: string = '[a-zA-Z0-9 ]*';

    public static emailRegex: string = '[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}';

    public static contactNumberRegex:string = '^[e0-9]{10,10}$';

    //variable
    public static error:string = 'error';

    // messages to display when the user is not authenticated
    public static unauthorized: string = 'You are not authorized to access this page.';
    
}