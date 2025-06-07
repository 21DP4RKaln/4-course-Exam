import fs from 'fs-extra';
import path from 'path';

export interface OrderPDFData {
  id: string;
  createdAt: Date;
  shippingName: string;
  shippingAddress: string;
  shippingEmail: string;
  shippingPhone: string;
  paymentMethod: string;
  shippingMethod: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    productType: string;
  }[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
}

/**
 * Generates a professional text receipt for an order
 * @param orderData Order data to include in the receipt
 * @returns Path to the generated text file
 */
export async function generateOrderPDF(
  orderData: OrderPDFData
): Promise<string> {
  const tempDir = path.join(process.cwd(), 'tmp');
  await fs.ensureDir(tempDir);

  const filename = `order-receipt-${orderData.id}.txt`;
  const outputPath = path.join(tempDir, filename);

  // Format date and time professionally
  const formattedDate = orderData.createdAt.toLocaleDateString('lv-LV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = orderData.createdAt.toLocaleTimeString('lv-LV', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate line total for each item
  const formatItemLine = (item: any) => {
    const lineTotal = item.price * item.quantity;
    return `${item.name.padEnd(35)} ${item.quantity.toString().padStart(3)} x €${item.price.toFixed(2).padStart(8)} = €${lineTotal.toFixed(2).padStart(10)}`;
  };

  // Create professional receipt content
  const receiptContent = `
╔═══════════════════════════════════════════════════════════════════════╗
║                              IVAPRO                                   ║
║                        PASŪTĪJUMA KVĪTS                               ║
╚═══════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASŪTĪJUMA INFORMĀCIJA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pasūtījuma ID:     ${orderData.id}
Datums:            ${formattedDate}
Laiks:             ${formattedTime}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PIEGĀDES INFORMĀCIJA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vārds:             ${orderData.shippingName}
Adrese:            ${orderData.shippingAddress}
E-pasts:           ${orderData.shippingEmail}
Telefons:          ${orderData.shippingPhone}

Maksājuma veids:   ${orderData.paymentMethod}
Piegādes veids:    ${orderData.shippingMethod}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASŪTĪTĀS PRECES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${'Produkts'.padEnd(35)} ${'Skaits'.padStart(8)} ${'Cena'.padStart(12)} ${'Kopā'.padStart(13)}
${'─'.repeat(35)} ${'─'.repeat(8)} ${'─'.repeat(12)} ${'─'.repeat(13)}
${orderData.items.map(formatItemLine).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

APRĒĶINS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Preču summa:                                              €${orderData.subtotal.toFixed(2).padStart(8)}
Piegādes izmaksas:                                        €${orderData.shippingCost.toFixed(2).padStart(8)}
${orderData.discount > 0 ? `Atlaide:                                                 -€${orderData.discount.toFixed(2).padStart(8)}` : ''}
PVN (21%):                                                €${orderData.taxAmount.toFixed(2).padStart(8)}
${'─'.repeat(71)}
KOPĀ APMAKSAI:                                            €${orderData.totalAmount.toFixed(2).padStart(8)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Paldies par jūsu pasūtījumu!

Ja jums ir jautājumi par šo pasūtījumu, lūdzu sazinieties ar mūsu 
klientu apkalpošanas komandu, norādot pasūtījuma ID.

Uzņēmuma rekvizīti:
SIA "IvaPro"
Reģ. Nr.: 40003XXXXXX
PVN maksātāja kods: LVXXXXXXX
Adrese: Rīga, Latvija

Kvīts ģenerēta: ${new Date().toLocaleString('lv-LV')}

╔═══════════════════════════════════════════════════════════════════════╗
║                     Saglabājiet šo kvīti!                            ║
╚═══════════════════════════════════════════════════════════════════════╝
`;

  await fs.writeFile(outputPath, receiptContent, 'utf8');
  return outputPath;
}

/**
 * Delete the generated receipt file
 * @param filePath Path to the receipt file to delete
 */
export async function cleanupPDF(filePath: string): Promise<void> {
  try {
    await fs.remove(filePath);
  } catch (error) {
    console.error('Error cleaning up receipt file:', error);
  }
}

/**
 * Generates a professional HTML receipt for an order that can be printed or converted to PDF
 * @param orderData Order data to include in the receipt
 * @returns Path to the generated HTML file
 */
export async function generateOrderHTML(
  orderData: OrderPDFData
): Promise<string> {
  const tempDir = path.join(process.cwd(), 'tmp');
  await fs.ensureDir(tempDir);

  const filename = `order-receipt-${orderData.id}.html`;
  const outputPath = path.join(tempDir, filename);

  // Format date and time professionally
  const formattedDate = orderData.createdAt.toLocaleDateString('lv-LV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = orderData.createdAt.toLocaleTimeString('lv-LV', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pasūtījuma kvīts - ${orderData.id}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        
        body {
            font-family: 'Courier New', monospace;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .receipt {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            text-align: center;
            border: 2px solid #333;
            padding: 15px;
            margin-bottom: 30px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .receipt-title {
            font-size: 18px;
            margin-top: 10px;
        }
        
        .section {
            margin-bottom: 25px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 15px;
        }
        
        .section:last-child {
            border-bottom: none;
        }
        
        .section-title {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
            text-transform: uppercase;
            border-bottom: 2px solid #333;
            padding-bottom: 5px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 8px;
            margin-bottom: 10px;
        }
        
        .label {
            font-weight: bold;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        .items-table th,
        .items-table td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .items-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        
        .text-right {
            text-align: right;
        }
        
        .pricing-table {
            width: 100%;
            margin-top: 15px;
        }
        
        .pricing-table td {
            padding: 5px 0;
        }
        
        .total-row {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #333;
            border-bottom: 2px solid #333;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 5px;
        }
        
        .print-btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-bottom: 20px;
        }
        
        .print-btn:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="no-print">
        <button class="print-btn" onclick="window.print()">🖨️ Drukāt kvīti</button>
    </div>
    
    <div class="receipt">
        <div class="header">
            <div class="company-name">IVAPRO</div>
            <div class="receipt-title">PASŪTĪJUMA KVĪTS</div>
        </div>
        
        <div class="section">
            <div class="section-title">Pasūtījuma informācija</div>
            <div class="info-grid">
                <span class="label">Pasūtījuma ID:</span>
                <span>${orderData.id}</span>
                <span class="label">Datums:</span>
                <span>${formattedDate}</span>
                <span class="label">Laiks:</span>
                <span>${formattedTime}</span>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Piegādes informācija</div>
            <div class="info-grid">
                <span class="label">Vārds:</span>
                <span>${orderData.shippingName}</span>
                <span class="label">Adrese:</span>
                <span>${orderData.shippingAddress}</span>
                <span class="label">E-pasts:</span>
                <span>${orderData.shippingEmail}</span>
                <span class="label">Telefons:</span>
                <span>${orderData.shippingPhone}</span>
                <span class="label">Maksājuma veids:</span>
                <span>${orderData.paymentMethod}</span>
                <span class="label">Piegādes veids:</span>
                <span>${orderData.shippingMethod}</span>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Pasūtītās preces</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Produkts</th>
                        <th>Tips</th>
                        <th class="text-right">Skaits</th>
                        <th class="text-right">Cena</th>
                        <th class="text-right">Kopā</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderData.items
                      .map(
                        item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.productType}</td>
                            <td class="text-right">${item.quantity}</td>
                            <td class="text-right">€${item.price.toFixed(2)}</td>
                            <td class="text-right">€${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `
                      )
                      .join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <div class="section-title">Aprēķins</div>
            <table class="pricing-table">
                <tr>
                    <td>Preču summa:</td>
                    <td class="text-right">€${orderData.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Piegādes izmaksas:</td>
                    <td class="text-right">€${orderData.shippingCost.toFixed(2)}</td>
                </tr>
                ${
                  orderData.discount > 0
                    ? `
                <tr>
                    <td>Atlaide:</td>
                    <td class="text-right">-€${orderData.discount.toFixed(2)}</td>
                </tr>
                `
                    : ''
                }
                <tr>
                    <td>PVN (21%):</td>
                    <td class="text-right">€${orderData.taxAmount.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>KOPĀ APMAKSAI:</strong></td>
                    <td class="text-right"><strong>€${orderData.totalAmount.toFixed(2)}</strong></td>
                </tr>
            </table>
        </div>
        
        <div class="footer">
            <p><strong>Paldies par jūsu pasūtījumu!</strong></p>
            <p>Ja jums ir jautājumi par šo pasūtījumu, lūdzu sazinieties ar mūsu klientu apkalpošanas komandu, norādot pasūtījuma ID.</p>
            
            <div style="margin-top: 20px; font-size: 12px;">
                <strong>Uzņēmuma rekvizīti:</strong><br>
                SIA "IvaPro"<br>
                Reģ. Nr.: 40003XXXXXX<br>
                PVN maksātāja kods: LVXXXXXXX<br>
                Adrese: Rīga, Latvija
            </div>
            
            <div style="margin-top: 15px; font-size: 11px; color: #666;">
                Kvīts ģenerēta: ${new Date().toLocaleString('lv-LV')}
            </div>
        </div>
    </div>
</body>
</html>`;

  await fs.writeFile(outputPath, htmlContent, 'utf8');
  return outputPath;
}

/**
 * Delete the generated receipt file
 * @param filePath Path to the receipt file to delete
 */
export async function cleanupHTML(filePath: string): Promise<void> {
  try {
    await fs.remove(filePath);
  } catch (error) {
    console.error('Error cleaning up receipt file:', error);
  }
}

/**
 * Generates both text and HTML receipts for an order
 * @param orderData Order data to include in the receipt
 * @returns Object with paths to both generated files
 */
export async function generateOrderReceipts(
  orderData: OrderPDFData
): Promise<{ textPath: string; htmlPath: string }> {
  const [textPath, htmlPath] = await Promise.all([
    generateOrderPDF(orderData),
    generateOrderHTML(orderData),
  ]);

  return { textPath, htmlPath };
}
