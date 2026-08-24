// Dev-only: builds a minimal, valid EPUB3 with Spanish text for manual and
// automated smoke testing — avoids needing a copyrighted book to verify the
// upload -> library -> reader -> selection flow.
// Run with: npm run gen:fixture
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { zipSync, strToU8 } from 'fflate';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'fixtures');
const outFile = join(outDir, 'sample-es.epub');

const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="es">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:uuid:lectura-sample-es-0001</dc:identifier>
    <dc:title>Cuento de prueba</dc:title>
    <dc:creator>Lectura</dc:creator>
    <dc:language>es</dc:language>
    <meta property="dcterms:modified">2026-01-01T00:00:00Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="chapter2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="chapter1"/>
    <itemref idref="chapter2"/>
  </spine>
</package>`;

const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="es">
<head><title>Índice</title></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Índice</h1>
    <ol>
      <li><a href="chapter1.xhtml">Capítulo uno</a></li>
      <li><a href="chapter2.xhtml">Capítulo dos</a></li>
    </ol>
  </nav>
</body>
</html>`;

const chapter1 = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="es">
<head><title>Capítulo uno</title></head>
<body>
  <h1>Capítulo uno</h1>
  <p>Ella habló con su hermano ayer por la tarde. Él le dijo que fue al mercado
  para comprar pan y frutas frescas. La ciudad donde vivían era pequeña,
  pero tenía un río hermoso que cruzaba el centro.</p>
  <p>Cuando era niña, María soñaba con viajar por el mundo entero.
  Ahora, después de tantos años, finalmente había comenzado su primer viaje.
  Sentía miedo, pero también una alegría inmensa que no podía explicar.</p>
  <p>—¿Has hablado con papá? — preguntó su hermano.
  —Todavía no — respondió ella —, pero voy a llamarlo esta noche.</p>
</body>
</html>`;

const chapter2 = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="es">
<head><title>Capítulo dos</title></head>
<body>
  <h1>Capítulo dos</h1>
  <p>El tren llegó tarde a la estación. Los pasajeros esperaban con paciencia
  bajo un cielo gris que amenazaba lluvia. Nadie sabía todavía que aquel viaje
  cambiaría sus vidas para siempre.</p>
  <p>Al llegar a la ciudad, María buscó un hotel cerca del río.
  Estaba cansada, pero feliz de haber llegado sana y salva.</p>
</body>
</html>`;

// mimetype must be stored uncompressed (level 0) per the EPUB spec — fflate's
// tuple form ([data, perFileOpts]) sets that without affecting the rest.
const zipped = zipSync(
	{
		mimetype: [strToU8('application/epub+zip'), { level: 0 }],
		'META-INF/container.xml': strToU8(containerXml),
		'OEBPS/content.opf': strToU8(contentOpf),
		'OEBPS/nav.xhtml': strToU8(navXhtml),
		'OEBPS/chapter1.xhtml': strToU8(chapter1),
		'OEBPS/chapter2.xhtml': strToU8(chapter2)
	},
	{ level: 6 }
);

await mkdir(outDir, { recursive: true });
await writeFile(outFile, zipped);
console.log(`Wrote ${outFile} (${zipped.byteLength} bytes)`);
