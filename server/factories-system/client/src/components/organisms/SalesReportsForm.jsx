import axios from 'axios';
import React, { useEffect, useState } from 'react';
import secrets from '../../helpers/secrets';
import DataGrid, {
  Column,
  Export,
  GroupPanel,
} from 'devextreme-react/data-grid';
import ExcelJS from 'exceljs';

function SalesReportsForm(props) {
  const [lastReportedSales, setLastReportedSales] = useState([]);
  const [lastReportedDate, setLastReportedDate] = useState('');

  useEffect(async () => {
    const lastReportedSales = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${
        secrets.FACTORIES_BACKEND_PORT
      }/orders?lastReportedSales=${localStorage.getItem('id')}`
    );

    setLastReportedSales(lastReportedSales.data.nonReportedDevices);

    if (lastReportedSales.data.lastReported !== null) {
      setLastReportedDate(lastReportedSales.data.lastReported);
    }

    props.setLoading(false);
  }, []);

  const formatDate = (date) => {
    if (date !== '') {
      const dateArray = date.split('T');
      const dateString = dateArray[0];
      const timeString = dateArray[1];
      const dateArray2 = dateString.split('-');
      const timeArray = timeString.split(':');
      const year = dateArray2[0];
      const month = dateArray2[1];
      const day = dateArray2[2];
      const hours = timeArray[0];
      const minutes = timeArray[1];
      const seconds = timeArray[2].split('.')[0];

      return `${day}/${month}/${year} a las ${hours}:${minutes}:${seconds}`;
    } else {
      return '----';
    }
  };

  const shortDate = (date) => {
    const dateArray = date.split('T');
    const dateString = dateArray[0];
    const dateArray2 = dateString.split('-');
    const year = dateArray2[0];
    const month = dateArray2[1];
    const day = dateArray2[2];

    return `${day}-${month}-${year}`;
  };

  /**
   * Create an ExcelJS workbook based on the data parameter
   * @param {Array} data
   * @returns {ExcelJS.Workbook}
   */
  const createWorkbook = (data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      `Reporte de ventas ${shortDate(lastReportedDate)}`
    );

    worksheet.columns = [
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Descripción', key: 'description', width: 50 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Color', key: 'color', width: 20 },
      { header: 'Código de Modelo', key: 'modelCode', width: 20 },
      { header: 'Tiempo de Garantía', key: 'warrantyTime', width: 20 },
      { header: 'Cantidad', key: 'quantity', width: 10 },
      { header: 'Precio', key: 'price', width: 10 },
      { header: 'Total', key: 'total', width: 10 },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        name: item.name,
        description: item.description,
        category: item.category,
        color: item.color,
        modelCode: item.model_code,
        warrantyTime: item.warranty_time,
        quantity: item.quantity,
        price: item.price,
        total: Number(Number(item.quantity) * Number(item.price)).toFixed(2),
      });
    });

    return workbook;
  };

  return !props.loading ? (
    lastReportedSales.length > 0 ? (
      <>
        <h4 className="mt-4">
          Reporte de ventas desde el {`${formatDate(lastReportedDate)}`} hasta
          hoy
        </h4>
        <DataGrid
          dataSource={lastReportedSales}
          showBorders={true}
          showRowLines={true}
          rowAlternationEnabled={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
        >
          <Column
            dataField="name"
            caption="Nombre"
            dataType="string"
            width={200}
          />
          <Column
            dataField="description"
            caption="Descripción"
            dataType="string"
            width={250}
          />
          <Column
            dataField="category"
            caption="Categoría"
            dataType="string"
            width={200}
          />
          <Column
            dataField="color"
            caption="Color"
            dataType="string"
            width={100}
          />
          <Column
            dataField="model_code"
            caption="Código de Modelo"
            dataType="string"
            width={150}
          />
          <Column
            dataField="warranty_time"
            caption="Tiempo de Garantía"
            dataType="number"
            width={150}
          />
          <Column
            dataField="quantity"
            caption="Cantidad"
            dataType="number"
            width={100}
          />
          <Column
            dataField="price"
            caption="Precio"
            dataType="number"
            width={100}
          />
        </DataGrid>
      </>
    ) : (
      <div className="mt-4 alert alert-warning" role="alert">
        <h5 className="alert-heading">
          No se han registrado ventas desde el{' '}
          {`${formatDate(lastReportedDate)}`}
        </h5>
      </div>
    )
  ) : (
    <></>
  );
}

export default SalesReportsForm;

