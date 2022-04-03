import axios from 'axios';
import React, { useEffect, useState } from 'react';
import helpers from '../../helpers/helpers';
import secrets from '../../helpers/secrets';

function SellerSalesList(props) {
  const [sellerSales, setSellerSales] = useState([]);
  const [clientsData, setClientsData] = useState([]);

  useEffect(async () => {
    const sellerId = localStorage.getItem('userId');
    const sales = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sellers?get=true&ventas=${sellerId}`
    );
    if (sales.data.success) {
      const salesList = sales.data.compras;
      const clientsDataList = [];

      for (let i = 0; i < salesList.length; i++) {
        // If the client's id is not in an object in the array, add it
        if (
          !helpers.isValueInArray(
            clientsDataList,
            'clientId',
            salesList[i][0].id_cliente
          )
        ) {
          const client = await axios.get(
            `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sales?table=clientes&id=${salesList[i][0].id_cliente}`
          );
          if (client.data.success) {
            clientsDataList.push({
              clientId: salesList[i][0].id_cliente,
              clientName: client.data.data.nombre,
            });
          }
        }
      }

      props.setLoading(false);
      setClientsData(clientsDataList);
      setSellerSales(salesList);
    }

    props.setLoading(false);
  }, []);

  return !props.loading ? (
    sellerSales.length !== 0 ? (
      <div className="purchases">
        {sellerSales.map((purchaseList, index) => (
          <div className="purchases-list" key={index}>
            <h5 className="text-left">Compra #{index + 1}</h5>
            <p style={{ marginBottom: '0' }}>
              Cliente:{' '}
              {
                clientsData[
                  helpers.getIndexOfObject(
                    clientsData,
                    'clientId',
                    purchaseList[0].id_cliente
                  )
                ].clientName
              }
            </p>
            <p style={{ marginBottom: '0' }}>
              Fecha: {helpers.formatDate(purchaseList[0].fecha_venta)}
            </p>
            <p className="mb-4">
              Dispositivos adquiridos: {purchaseList[0].dispositivos_totales}
            </p>
            <table className="table purchases-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              {purchaseList.map((purchase, index) => (
                <tbody key={index}>
                  <tr>
                    <td>{purchase.nombre}</td>
                    <td>
                      {helpers.getFormattedCurrency('Q. ', purchase.precio)}
                    </td>
                    <td>x {purchase.dispositivos_adquiridos}</td>
                    <td className="text-right">
                      {helpers.getFormattedCurrency(
                        'Q. ',
                        purchase.precio * purchase.dispositivos_adquiridos
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4}>
                      <strong>Descripción: </strong>
                      {purchase.descripcion.length <= 100
                        ? purchase.descripcion
                        : purchase.descripcion.substring(0, 100) + '...'}
                    </td>
                  </tr>
                </tbody>
              ))}
            </table>
            <table className="table purchases-table">
              <tbody>
                <tr>
                  <td className="font-italic">
                    <strong>Subtotal:</strong>
                  </td>
                  <td className="text-right">
                    {helpers.getFormattedCurrency(
                      'Q. ',
                      purchaseList.reduce(
                        (acc, purchase) =>
                          acc +
                          purchase.precio * purchase.dispositivos_adquiridos,
                        0
                      )
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="font-italic">
                    <strong>Descuentos:</strong>
                  </td>
                  <td className="text-right">
                    {helpers.getFormattedCurrency(
                      '- Q. ',
                      purchaseList.reduce(
                        (acc, purchase) => acc + purchase.descuentos,
                        0
                      )
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="font-italic">
                    <strong>Impuestos + Comisión de Ventas:</strong>
                  </td>
                  <td className="text-right">
                    {helpers.getFormattedCurrency(
                      'Q. ',
                      purchaseList.reduce(
                        (acc, purchase) => acc + purchase.impuestos,
                        0
                      )
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="font-italic">
                    <strong>Total:</strong>
                  </td>
                  <td className="text-right">
                    {helpers.getFormattedCurrency(
                      'Q. ',
                      purchaseList.reduce(
                        (acc, purchase) => acc + purchase.total_venta,
                        0
                      )
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    ) : (
      <div className="alert alert-info mt-4">
        <h5 className="text-center">No ha realizado ninguna venta aún.</h5>
      </div>
    )
  ) : (
    <></>
  );
}

export default SellerSalesList;

