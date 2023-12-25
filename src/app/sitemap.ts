import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://www.l2savings.org/",
            lastModified: new Date(),
            priority: 1,
        },
        {
            url: "https://www.l2savings.org/faq/",
            lastModified: new Date(),
            priority: 1,
        },
    ]
}
