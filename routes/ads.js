// Importação de dependências necessárias
const express = require('express');
const multer = require('multer');
const path = require('path');
const Ad = require('../models/Ad');
const router = express.Router();

// Configuração das cores para cada cidade
// Utilize um objeto congelado para prevenir modificações acidentais
const cityColors = Object.freeze({
    "Santa Maria": "bg-gray-500",
    "Ceilândia": "bg-blue-500",
    "Taguatinga": "bg-indigo-500",
    "Sobradinho": "bg-green-500"
});

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        // Gera um nome único para o arquivo usando timestamp e extensão original
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Configuração de filtro para tipos de arquivos permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não suportado'), false);
    }
};

// Inicialização do multer com as configurações
const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB por arquivo
    }
});

// Rota GET para exibir o formulário de novo anúncio
router.get('/new', (req, res) => {
    try {
        res.render('addAd', { cityColors });
    } catch (error) {
        console.error('Erro ao renderizar formulário:', error);
        res.status(500).send('Erro ao carregar o formulário');
    }
});

// Rota POST para processar o novo anúncio
router.post('/new', upload.array('photos', 5), async (req, res) => {
    try {
        const { name, description, city } = req.body;

        // Validação básica dos campos
        if (!name || !description || !city) {
            return res.status(400).send('Todos os campos são obrigatórios');
        }

        // Processa as fotos enviadas
        const photos = req.files.map(file => `/uploads/${file.filename}`);

        // Cria e salva o novo anúncio
        const newAd = new Ad({
            name: name.trim(),
            description: description.trim(),
            city,
            photos,
            createdAt: new Date()
        });

        await newAd.save();
        res.redirect('/');

    } catch (error) {
        console.error('Erro ao salvar anúncio:', error);
        res.status(500).send('Erro ao salvar o anúncio');
    }
});


// Define uma rota GET que aceita um parâmetro de URL chamado 'id'
router.get('/:id', async (req, res) => {
    // Extrai o parâmetro 'id' da URL
    const { id } = req.params;
    try {
        // Tenta encontrar um anúncio no banco de dados pelo ID
        const ad = await Ad.findById(id);
        // Se o anúncio não for encontrado, retorna um status 404 com uma mensagem
        if (!ad) {
            return res.status(404).send("Anúncio não encontrado");
        }
        // Se o anúncio for encontrado, renderiza a página 'adDetails' passando o anúncio e 'cityColors' como dados
        res.render('addetails', { ad, cityColors });
    } catch (error) {
        // Em caso de erro, registra o erro no console e retorna um status 500 com uma mensagem
        console.error("Erro ao buscar o anúncio:", error);
        res.status(500).send("Erro interno do servidor");
    }
});


// Exportações
module.exports = router;
module.exports.cityColors = cityColors;