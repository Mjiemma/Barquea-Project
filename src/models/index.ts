// Exportar todos los modelos de MongoDB
export { User, IUser } from './User';
export { Boat, IBoat } from './Boat';
export { Booking, IBooking } from './Booking';

// Re-exportar mongoose para conveniencia
export { default as mongoose } from 'mongoose';
