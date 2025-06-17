import { jsPDF } from 'jspdf';

export interface ConfigurationPDFData {
  id: string;
  name: string;
  createdAt: Date;
  totalPrice: number;
  totalPowerConsumption: number;
  recommendedPsuWattage: string;
  components: {
    categoryName: string;
    componentName: string;
    price: number;
    specifications: Record<string, string>;
  }[];
}

/**
 * Generates a professional configuration PDF
 * @param configData Configuration data to include in the PDF
 * @returns Buffer containing the PDF data
 */
export async function generateConfigurationPDF(
  configData: ConfigurationPDFData
): Promise<Buffer> {
  try {
    console.log('Starting PDF generation for config:', configData.id);

    const doc = new jsPDF();

    const formattedDate = configData.createdAt.toLocaleDateString('lv-LV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = configData.createdAt.toLocaleTimeString('lv-LV', {
      hour: '2-digit',
      minute: '2-digit',
    });

    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55);
    doc.text('IVAPRO', 20, 30);

    doc.setFontSize(16);
    doc.text('DATORA KONFIGURĀCIJAS SARAKSTS', 20, 45);

    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(2);
    doc.line(20, 55, 190, 55);

    let yPosition = 75;

    doc.setFontSize(14);
    doc.setTextColor(55, 65, 81);
    doc.text('KONFIGURĀCIJAS INFORMĀCIJA:', 20, yPosition);

    yPosition += 15;
    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128);
    doc.text(`Konfigurācijas ID: ${configData.id}`, 25, yPosition);
    doc.text(`Nosaukums: ${configData.name}`, 25, yPosition + 10);
    doc.text(`Izveidošanas datums: ${formattedDate}`, 25, yPosition + 20);
    doc.text(`Izveidošanas laiks: ${formattedTime}`, 25, yPosition + 30);

    yPosition += 50;

    doc.setFontSize(14);
    doc.setTextColor(55, 65, 81);
    doc.text('KOMPONENTES:', 20, yPosition);

    yPosition += 15;

    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text('Kategorija', 20, yPosition);
    doc.text('Komponente', 60, yPosition);
    doc.text('Cena', 140, yPosition);
    doc.text('Specifikācijas', 160, yPosition);

    yPosition += 10;

    doc.setDrawColor(107, 114, 128);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);

    yPosition += 5;

    configData.components.forEach(component => {
      const specifications = Object.entries(component.specifications)
        .filter(([key, value]) => value && value !== 'N/A')
        .slice(0, 2)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(component.categoryName, 20, yPosition);
      doc.text(
        component.componentName.substring(0, 25) +
          (component.componentName.length > 25 ? '...' : ''),
        60,
        yPosition
      );
      doc.text(`€${component.price.toFixed(2)}`, 140, yPosition);
      doc.text(
        specifications.substring(0, 30) +
          (specifications.length > 30 ? '...' : ''),
        160,
        yPosition
      );

      yPosition += 10;

      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
    });

    yPosition += 10;

    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(1);
    doc.line(20, yPosition, 190, yPosition);

    yPosition += 15;

    doc.setFontSize(14);
    doc.setTextColor(55, 65, 81);
    doc.text('KOPSAVILKUMS:', 20, yPosition);

    yPosition += 15;
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Kopējā cena: €${configData.totalPrice.toFixed(2)}`,
      25,
      yPosition
    );
    doc.text(
      `Kopējais enerģijas patēriņš: ${configData.totalPowerConsumption}W`,
      25,
      yPosition + 10
    );
    doc.text(
      `Ieteicamā barošanas bloka jauda: ${configData.recommendedPsuWattage}`,
      25,
      yPosition + 20
    );

    yPosition += 40;

    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text(
      'Šī konfigurācija ir izveidota izmantojot IvaPro datora konstruktoru.',
      20,
      yPosition
    );
    doc.text(
      'Ja jums ir jautājumi par šo konfigurāciju, lūdzu sazinieties ar mūsu',
      20,
      yPosition + 10
    );
    doc.text('klientu apkalpošanas komandu.', 20, yPosition + 20);

    yPosition += 35;

    // Company info
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text('SIA "IvaPro"', 20, yPosition);
    doc.text('Reģ. Nr.: 40003XXXXXX', 20, yPosition + 8);
    doc.text('PVN maksātāja kods: LVXXXXXXX', 20, yPosition + 16);
    doc.text('Adrese: Rīga, Latvija', 20, yPosition + 24);

    yPosition += 35;

    // Generation timestamp
    doc.setFontSize(8);
    doc.setTextColor(209, 213, 219);
    doc.text(
      `Dokuments ģenerēts: ${new Date().toLocaleString('lv-LV')}`,
      20,
      yPosition
    );
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    console.log('PDF generated successfully, buffer size:', pdfBuffer.length);
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF with jsPDF:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        configId: configData.id,
        environment: process.env.NODE_ENV,
      });
    } else {
      console.error('Error details:', {
        message: String(error),
        configId: configData.id,
        environment: process.env.NODE_ENV,
      });
    }
    throw new Error('Failed to generate PDF');
  }
}
