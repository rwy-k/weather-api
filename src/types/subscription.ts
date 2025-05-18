export enum Frequency {
    Hourly = 'hourly',
    Daily = 'daily'
} 

export interface Subscription{
    email: string;
    city: string;
    frequency: Frequency;
    confirmed: boolean;   
}