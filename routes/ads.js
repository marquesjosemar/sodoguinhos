// Importação de dependências necessárias
const express = require('express');
const multer = require('multer');
const path = require('path');
const Ad = require('../models/Ad');
const router = express.Router();

// Middleware de autenticação
const checkAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        return next();
    } else {
        return res.redirect('/login');
    }
};




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
router.get('/new', checkAuth, (req, res) => {
    try {
        res.render('newAd');
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
            createdAt: new Date(),
            userId: req.session.user._id // Associa o ID do usuário autenticado ao anúncio
        });

        await newAd.save();
        
        // Redireciona para o dashboard com mensagem de sucesso
        res.redirect('/dashboard?success=true');
        
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
        res.render('addetails', { ad});
    } catch (error) {
        // Em caso de erro, registra o erro no console e retorna um status 500 com uma mensagem
        console.error("Erro ao buscar o anúncio:", error);
        res.status(500).send("Erro interno do servidor");
    }
});



// Rota para exibir o formulário de edição
router.get('/:id/edit', async (req, res) => {
    try {
      const ad = await Ad.findById(req.params.id);
      if (!ad || ad.userId.toString() !== req.session.user._id) {
        return res.status(403).send('Você não tem permissão para editar este anúncio.');
      }
      res.render('editAd', { ad });
    } catch (error) {
      console.error('Erro ao carregar o anúncio para edição:', error);
      res.status(500).send('Erro ao carregar o anúncio.');
    }
  });
  
  // Rota para processar a edição
  router.post('/:id/edit', async (req, res) => {
    try {
      const { name, description, city } = req.body;
  
      const ad = await Ad.findById(req.params.id);
      if (!ad || ad.userId.toString() !== req.session.user._id) {
        return res.status(403).send('Você não tem permissão para editar este anúncio.');
      }
  
      ad.name = name;
      ad.description = description;
      ad.city = city;
      await ad.save();
  
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar alterações do anúncio:', error);
      res.status(500).send('Erro ao salvar as alterações do anúncio.');
    }
  });

  

  // Rota para excluir o anúncio
router.post('/:id/delete', async (req, res) => {
    try {
      const ad = await Ad.findById(req.params.id);
      if (!ad || ad.userId.toString() !== req.session.user._id) {
        return res.status(403).send('Você não tem permissão para excluir este anúncio.');
      }
  
      await ad.deleteOne();
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Erro ao excluir o anúncio:', error);
      res.status(500).send('Erro ao excluir o anúncio.');
    }
  });

  


// Exportações
module.exports = router;
