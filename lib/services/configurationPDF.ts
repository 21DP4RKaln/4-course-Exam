import fs from 'fs-extra';
import path from 'path';
import PDFDocument from 'pdfkit';

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
 * @returns Path to the generated PDF file
 */
export async function generateConfigurationPDF(
  configData: ConfigurationPDFData
): Promise<string> {
  const tempDir = path.join(process.cwd(), 'tmp');
  await fs.ensureDir(tempDir);

  const filename = `configuration-${configData.id}.pdf`;
  const outputPath = path.join(tempDir, filename);
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document with explicit font settings
      const doc = new PDFDocument({
        margin: 50,
        font: 'Times-Roman', // Use built-in PDF font instead of system font
      });

      // Pipe the PDF to a file
      doc.pipe(fs.createWriteStream(outputPath));

      // Format date and time professionally
      const formattedDate = configData.createdAt.toLocaleDateString('lv-LV', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = configData.createdAt.toLocaleTimeString('lv-LV', {
        hour: '2-digit',
        minute: '2-digit',
      }); // Header
      doc
        .font('Times-Bold')
        .fontSize(20)
        .fillColor('#1f2937')
        .text('IVAPRO', 50, 50);
      doc
        .font('Times-Bold')
        .fontSize(16)
        .text('DATORA KONFIGURĀCIJAS SARAKSTS', 50, 80);

      // Draw header line
      doc
        .strokeColor('#dc2626')
        .lineWidth(2)
        .moveTo(50, 110)
        .lineTo(545, 110)
        .stroke();

      let yPosition = 140; // Configuration Information
      doc
        .font('Times-Bold')
        .fontSize(14)
        .fillColor('#374151')
        .text('KONFIGURĀCIJAS INFORMĀCIJA:', 50, yPosition);
      yPosition += 30;
      doc
        .font('Times-Roman')
        .fontSize(11)
        .fillColor('#6b7280')
        .text(`Konfigurācijas ID: ${configData.id}`, 70, yPosition)
        .text(`Nosaukums: ${configData.name}`, 70, yPosition + 20)
        .text(`Izveidošanas datums: ${formattedDate}`, 70, yPosition + 40)
        .text(`Izveidošanas laiks: ${formattedTime}`, 70, yPosition + 60);

      yPosition += 100; // Components section
      doc
        .font('Times-Bold')
        .fontSize(14)
        .fillColor('#374151')
        .text('KOMPONENTES:', 50, yPosition);
      yPosition += 30; // Table headers
      doc
        .font('Times-Bold')
        .fontSize(10)
        .fillColor('#374151')
        .text('Kategorija', 50, yPosition)
        .text('Komponente', 150, yPosition)
        .text('Cena', 400, yPosition)
        .text('Galvenās specifikācijas', 450, yPosition);

      yPosition += 20;

      // Draw table header line
      doc
        .strokeColor('#d1d5db')
        .lineWidth(1)
        .moveTo(50, yPosition)
        .lineTo(545, yPosition)
        .stroke();
      yPosition += 10;

      // Components
      configData.components.forEach((component, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        const specs = Object.entries(component.specifications)
          .filter(([key, value]) => value && value !== 'N/A')
          .slice(0, 2) // Limit to 2 specs for space
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        doc
          .font('Times-Roman')
          .fontSize(9)
          .fillColor('#6b7280')
          .text(component.categoryName, 50, yPosition)
          .text(
            component.componentName.substring(0, 35) +
              (component.componentName.length > 35 ? '...' : ''),
            150,
            yPosition
          )
          .text(`€${component.price.toFixed(2)}`, 400, yPosition)
          .text(
            specs.substring(0, 40) + (specs.length > 40 ? '...' : ''),
            450,
            yPosition
          );

        yPosition += 20;

        // Add separator line every few items
        if ((index + 1) % 3 === 0) {
          doc
            .strokeColor('#f3f4f6')
            .lineWidth(0.5)
            .moveTo(50, yPosition)
            .lineTo(545, yPosition)
            .stroke();
          yPosition += 5;
        }
      });

      yPosition += 20; // Summary section
      doc
        .strokeColor('#dc2626')
        .lineWidth(1)
        .moveTo(50, yPosition)
        .lineTo(545, yPosition)
        .stroke();
      yPosition += 20;

      doc
        .font('Times-Bold')
        .fontSize(14)
        .fillColor('#374151')
        .text('KOPSAVILKUMS:', 50, yPosition);
      yPosition += 30;
      doc
        .font('Times-Roman')
        .fontSize(12)
        .fillColor('#6b7280')
        .text(
          `Kopējā cena: €${configData.totalPrice.toFixed(2)}`,
          70,
          yPosition
        )
        .text(
          `Elektroenerģijas patēriņš: ${configData.totalPowerConsumption}W`,
          70,
          yPosition + 25
        )
        .text(
          `Ieteicamais barošanas bloks: ${configData.recommendedPsuWattage}`,
          70,
          yPosition + 50
        );

      yPosition += 100; // Footer
      doc
        .font('Times-Roman')
        .fontSize(10)
        .fillColor('#9ca3af')
        .text(
          'Šī konfigurācija ir izveidota izmantojot IvaPro datora konstruktoru.',
          50,
          yPosition
        )
        .text(
          'Ja jums ir jautājumi par šo konfigurāciju, lūdzu sazinieties ar mūsu',
          50,
          yPosition + 20
        )
        .text('klientu apkalpošanas komandu.', 50, yPosition + 35);

      yPosition += 70;
      doc
        .font('Times-Roman')
        .fontSize(9)
        .fillColor('#9ca3af')
        .text('SIA "IvaPro"', 50, yPosition)
        .text('Reģ. Nr.: 40003XXXXXX', 50, yPosition + 15)
        .text('PVN maksātāja kods: LVXXXXXXX', 50, yPosition + 30)
        .text('Adrese: Rīga, Latvija', 50, yPosition + 45);

      yPosition += 75;
      doc
        .font('Times-Roman')
        .fontSize(8)
        .fillColor('#d1d5db')
        .text(
          `Dokuments ģenerēts: ${new Date().toLocaleString('lv-LV')}`,
          50,
          yPosition
        );

      // Finalize the PDF
      doc.end();

      doc.on('end', () => {
        resolve(outputPath);
      });

      doc.on('error', error => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Delete the generated configuration file
 * @param filePath Path to the configuration file to delete
 */
export async function cleanupConfigurationPDF(filePath: string): Promise<void> {
  try {
    await fs.remove(filePath);
  } catch (error) {
    console.error('Error cleaning up configuration file:', error);
  }
}
