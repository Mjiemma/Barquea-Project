const mongoose = require('mongoose');

// Cadena de conexión a MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://esuarezgcc_db_user:hyEjcxiyLnYrZY1u@cluster0.25epi8j.mongodb.net/barquea_db?retryWrites=true&w=majority';

async function testConnection() {
    try {
        console.log('🔄 Conectando a MongoDB Atlas...');

        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ ¡Conectado exitosamente a MongoDB Atlas!');
        console.log('📊 Base de datos:', mongoose.connection.name);
        console.log('🌐 Host:', mongoose.connection.host);
        console.log('🔌 Puerto:', mongoose.connection.port);

        // Crear un documento de prueba
        const testSchema = new mongoose.Schema({
            name: String,
            message: String,
            timestamp: { type: Date, default: Date.now }
        });

        const TestModel = mongoose.model('TestConnection', testSchema);

        // Insertar documento de prueba
        const testDoc = new TestModel({
            name: 'Barquea Test',
            message: 'Conexión exitosa desde Node.js'
        });

        await testDoc.save();
        console.log('✅ Documento de prueba creado');

        // Buscar el documento
        const foundDoc = await TestModel.findOne({ name: 'Barquea Test' });
        console.log('✅ Documento encontrado:', foundDoc);

        // Limpiar documento de prueba
        await TestModel.deleteOne({ name: 'Barquea Test' });
        console.log('✅ Documento de prueba eliminado');

        console.log('\n🎉 ¡Todo funcionando correctamente!');
        console.log('📋 Ahora puedes usar esta cadena de conexión en MongoDB Compass:');
        console.log('   mongodb+srv://esuarezgcc_db_user:hyEjcxiyLnYrZY1u@cluster0.25epi8j.mongodb.net/barquea_db');

    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Desconectado de MongoDB');
    }
}

testConnection();
