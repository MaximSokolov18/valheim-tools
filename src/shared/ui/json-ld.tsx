import { serializeJsonLd, type JsonLdObject } from '../seo/json-ld';

export function JsonLd({ data }: { data: JsonLdObject }) {
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
