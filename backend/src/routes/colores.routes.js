// src/routes/colores.routes.js
import express from 'express';
import { Color } from '../models/index.js';

const router = express.Router();

// GET all colors
router.get('/', async (req, res) => {
    try {
        const colores = await Color.findAll({
            order: [['Nombre', 'ASC']]
        });
        res.status(200).json({
            success: true,
            data: colores
        });
    } catch (error) {
        console.error('Error fetching colors:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los colores',
            error: error.message
        });
    }
});

export default router;
