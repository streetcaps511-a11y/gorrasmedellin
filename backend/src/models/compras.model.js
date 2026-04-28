import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Compra = sequelize.define('Compra', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'IdCompra'
    },
    idProveedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'IdProveedor'
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'Fecha'
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'Total'
    },
    totalFactura: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'TotalFactura'
    },
    metodoPago: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Efectivo',
        field: 'MetodoPago'
    },
    estado: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Completada',
        field: 'Estado'
    }
}, {
    tableName: 'Compras',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

export default Compra;