import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const CompraDetalle = sequelize.define('CompraDetalle', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'IdDetalle'
    },
    idCompra: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'IdCompra',
        references: {
            model: 'Compras',
            key: 'IdCompra'
        }
    },
    idProducto: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'IdProducto',
        comment: 'ID del producto en tabla Productos (opcional)'
    },
    idTalla: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'IdTalla'
    },
    nombreProducto: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'NombreProducto'
    },
    talla: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'Talla'
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1 },
        field: 'Cantidad'
    },
    precioCompra: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'PrecioCompra'
    },
    precioVenta: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: 'PrecioVenta'
    },
    precioMayorista6: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: 'PrecioMayorista6'
    },
    precioMayorista80: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: 'PrecioMayorista80'
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: 'Subtotal',
        comment: 'Cantidad * PrecioCompra (calculado en backend)'
    }
}, {
    tableName: 'CompraDetalles',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

export default CompraDetalle;