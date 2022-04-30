import axios from 'axios';
import React, { useEffect, useState } from 'react';
import secrets from '../../helpers/secrets';
import DataGrid, {
  Column,
  Export,
  GroupPanel,
} from 'devextreme-react/data-grid';
import ExcelJS from 'exceljs';
import helpers from '../../helpers/helpers';

function SalesReportsForm(props) {
  const [lastReportedSales, setLastReportedSales] = useState([]);
  const [salesTotal, setSalesTotal] = useState([]);
  const [lastReportedDate, setLastReportedDate] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');

  useEffect(async () => {
    const lastReportedSales = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${
        secrets.FACTORIES_BACKEND_PORT
      }/orders?lastReportedSales=${localStorage.getItem('id')}`
    );
    // const testData = {
    //   nonReportedDevices: [
    //     {
    //       category: 'Telefono Inteligente',
    //       color: 'Negro',
    //       description: 'Samsung Galaxy S12',
    //       model_code: 'TISGS12',
    //       name: 'Samsung Galaxy S12',
    //       price: 7499.99,
    //       quantity: 5,
    //       warranty_time: 2,
    //       _id: '62591100e28f664a15d79cde',
    //     },
    //     {
    //       category: 'Telefono Inteligente',
    //       color: 'Negro',
    //       description: 'Samsung Galaxy S12',
    //       model_code: 'TISGS12',
    //       name: 'Samsung Galaxy S12',
    //       price: 7499.99,
    //       quantity: 5,
    //       warranty_time: 2,
    //       _id: '62591100e28f664a15d79cde',
    //     },
    //     {
    //       category: 'Telefono Inteligente',
    //       color: 'Negro',
    //       description: 'Samsung Galaxy S12',
    //       model_code: 'TISGS12',
    //       name: 'Samsung Galaxy S12',
    //       price: 7499.99,
    //       quantity: 5,
    //       warranty_time: 2,
    //       _id: '62591100e28f664a15d79cde',
    //     },
    //   ],
    //   devicesCount: 1,
    //   lastReported: '2022-04-18T13:35:09.697Z',
    // };

    const total = lastReportedSales.data.nonReportedDevices.reduce(
      (acc, curr) => acc + curr.price * curr.quantity,
      0
    );
    // const total = testData.nonReportedDevices.reduce(
    //   (acc, curr) => acc + curr.price * curr.quantity,
    //   0
    // );
    setSalesTotal([
      {
        quantity: 'Total',
        price: Number(total).toFixed(2),
      },
    ]);

    setLastReportedSales(lastReportedSales.data.nonReportedDevices);
    // setLastReportedSales(testData.nonReportedDevices);

    if (lastReportedSales.data.lastReported !== null) {
      setLastReportedDate(lastReportedSales.data.lastReported);
    }
    // if (testData.lastReported !== null) {
    //   setLastReportedDate(testData.lastReported);
    // }

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

  const getReportTitle = () => {
    // Get today's date in the format dd/mm/yyyy
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    if (lastReportedDate === '') {
      return 'Reporte de Ventas';
    } else {
      return `Reporte de Ventas - ${shortDate(lastReportedDate)} - ${day}-${
        month < 10 ? '0' + month : month
      }-${year}`;
    }
  };

  const handleSubmit = async () => {
    props.setLoading(true);

    if (emailRecipient !== '') {
      if (helpers.isValidEmail(emailRecipient)) {
        try {
          const response = await axios.post(
            `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/orders?sendSalesReport=${emailRecipient}`,
            {
              total: salesTotal[0].price,
              title: getReportTitle(),
              items: lastReportedSales,
            }
          );

          if (response.data.success) {
            props.setLoading(false);
            helpers.showModal(
              'Operación exitosa',
              `El reporte de ventas fue enviado a ${emailRecipient}`
            );
          } else {
            props.setLoading(false);
            helpers.showModal(
              'Ocurrió un error',
              'Hubo un error al intentar de enviar el reporte. Por favor, inténtelo de nuevo.'
            );
          }
        } catch (error) {
          props.setLoading(false);
          helpers.showModal(
            'Ocurrió un error',
            'Hubo un error al intentar de enviar el reporte. Por favor, inténtelo de nuevo.'
          );
        }
      } else {
        props.setLoading(false);
        helpers.showModal(
          'Correo electrónico inválido',
          'Por favor ingrese un correo electrónico válido'
        );
      }
    } else {
      props.setLoading(false);
      helpers.showModal(
        'Datos incompletos',
        'Por favor, ingrese un destinatario e intente nuevamente.'
      );
    }
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
        <DataGrid
          dataSource={salesTotal}
          showBorders={true}
          showRowLines={true}
          rowAlternationEnabled={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
        >
          <Column dataField="name" caption="" dataType="string" width={200} />
          <Column
            dataField="description"
            caption=""
            dataType="string"
            width={250}
          />
          <Column
            dataField="category"
            caption=""
            dataType="string"
            width={200}
          />
          <Column dataField="color" caption="" dataType="string" width={100} />
          <Column
            dataField="model_code"
            caption=""
            dataType="string"
            width={150}
          />
          <Column
            dataField="warranty_time"
            caption=""
            dataType="number"
            width={150}
          />
          <Column
            dataField="quantity"
            caption=""
            dataType="number"
            width={100}
          />
          <Column dataField="price" caption="" dataType="number" width={100} />
        </DataGrid>
        <h3 className="text mt-4">Enviar reporte por correo electrónico</h3>
        <div className="form-group">
          <label>Destinatario</label>
          <input
            type="email"
            className="form-control"
            placeholder="Ingrese el correo electrónico del destinatario"
            onChange={(e) => setEmailRecipient(e.target.value)}
            style={{
              width: '100%',
            }}
          />
          <button
            className="btn btn-primary mt-2"
            onClick={handleSubmit}
            style={{
              width: '100%',
            }}
          >
            Enviar
          </button>
        </div>
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

