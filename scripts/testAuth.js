const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Cadena de conexión a MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://esuarezgcc_db_user:hyEjcxiyLnYrZY1u@cluster0.25epi8j.mongodb.net/barquea_db?retryWrites=true&w=majority';

// Configuración JWT
const JWT_SECRET = 'barquea-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

// Esquema de usuario simplificado para prueba
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    isHost: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: true }, // Para pruebas
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

const User = mongoose.model('User', userSchema);

async function testAuthFlow() {
    try {
        console.log('🔄 Conectando a MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB Atlas');

        // Limpiar usuarios de prueba anteriores
        await User.deleteMany({ email: { $regex: /test.*@barquea\.com/ } });
        console.log('🧹 Usuarios de prueba anteriores eliminados');

        // 1. Probar registro
        console.log('\n📝 Probando registro de usuario...');

        const testUser = {
            email: 'test@barquea.com',
            firstName: 'Usuario',
            lastName: 'Prueba',
            password: 'test123456',
            phone: '+58 414 123 4567',
            isHost: false
        };

        // Encriptar contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(testUser.password, saltRounds);

        // Crear usuario
        const newUser = new User({
            ...testUser,
            password: hashedPassword,
            isEmailVerified: true
        });

        const savedUser = await newUser.save();
        console.log('✅ Usuario registrado:', savedUser.email);

        // 2. Probar login
        console.log('\n🔐 Probando login...');

        const loginUser = await User.findOne({ email: testUser.email });
        if (!loginUser) {
            throw new Error('Usuario no encontrado');
        }

        const isPasswordValid = await bcrypt.compare(testUser.password, loginUser.password);
        if (!isPasswordValid) {
            throw new Error('Contraseña inválida');
        }

        console.log('✅ Login exitoso para:', loginUser.email);

        // 3. Generar token JWT
        console.log('\n🎫 Generando token JWT...');

        const token = jwt.sign(
            {
                userId: loginUser._id,
                email: loginUser.email,
                isHost: loginUser.isHost
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        console.log('✅ Token generado:', token.substring(0, 50) + '...');

        // 4. Verificar token
        console.log('\n🔍 Verificando token...');

        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token verificado para usuario:', decoded.email);

        // 5. Buscar usuario por token
        console.log('\n👤 Buscando usuario por token...');

        const userFromToken = await User.findById(decoded.userId);
        console.log('✅ Usuario encontrado:', userFromToken.email);

        // 6. Probar actualización de perfil
        console.log('\n✏️ Probando actualización de perfil...');

        const updatedUser = await User.findByIdAndUpdate(
            loginUser._id,
            {
                firstName: 'Usuario Actualizado',
                phone: '+58 414 999 9999'
            },
            { new: true }
        );

        console.log('✅ Perfil actualizado:', updatedUser.firstName, updatedUser.phone);

        // 7. Probar cambio de contraseña
        console.log('\n🔒 Probando cambio de contraseña...');

        const newPassword = 'newpassword123';
        const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await User.findByIdAndUpdate(loginUser._id, { password: newHashedPassword });

        // Verificar nueva contraseña
        const userWithNewPassword = await User.findById(loginUser._id);
        const isNewPasswordValid = await bcrypt.compare(newPassword, userWithNewPassword.password);

        if (isNewPasswordValid) {
            console.log('✅ Cambio de contraseña exitoso');
        } else {
            throw new Error('Error en cambio de contraseña');
        }

        // 8. Limpiar datos de prueba
        console.log('\n🧹 Limpiando datos de prueba...');
        await User.findByIdAndDelete(loginUser._id);
        console.log('✅ Datos de prueba eliminados');

        console.log('\n🎉 ¡Todas las pruebas de autenticación pasaron exitosamente!');
        console.log('\n📋 Resumen de pruebas:');
        console.log('   ✅ Registro de usuario');
        console.log('   ✅ Login con contraseña');
        console.log('   ✅ Generación de token JWT');
        console.log('   ✅ Verificación de token');
        console.log('   ✅ Búsqueda de usuario');
        console.log('   ✅ Actualización de perfil');
        console.log('   ✅ Cambio de contraseña');
        console.log('   ✅ Limpieza de datos');

        console.log('\n🚀 ¡El sistema de autenticación con MongoDB está listo!');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Desconectado de MongoDB');
    }
}

testAuthFlow();
