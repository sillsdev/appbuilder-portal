export const inLocalDevelopment = process.env.NODE_ENV === 'development';

export const logLocalDev = inLocalDevelopment ? console.log : undefined;
