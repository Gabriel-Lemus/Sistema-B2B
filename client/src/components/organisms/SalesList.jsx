import axios from 'axios';
import React, { useEffect, useState } from 'react';
import helpers from '../../helpers/helpers';

function SalesList(props) {
  const [userPurchases, setUserPurchases] = useState([]);

  useEffect(async () => {
    const userId = localStorage.getItem('userId');
    const purchases = await axios.get(
      `http://localhost:8080/sales-system/sellers?get=true&compras=${userId}`
    );
    if (purchases.data.success) {
      setUserPurchases(purchases.data.compras);
    }

    props.setLoading(false);
  }, []);

  return !props.loading ? (
    userPurchases.length !== 0 ? (
      <div className="purchases">
        {userPurchases.map((purchaseList, index) => (
          <div className="purchases-list" key={index}>
            <h5 className="text-left">Compra #{index + 1}</h5>
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
        <h5 className="text-center">No ha realizado ninguna compra aún.</h5>
      </div>
    )
  ) : (
    <></>
  );
}

export default SalesList;

