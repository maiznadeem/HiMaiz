const APEX = "https://himaiz.com";

const worker = {
    fetch(request) {
        const { pathname, search } = new URL(request.url);
        // Only the path and query are copied; the host is fixed, so this can't redirect elsewhere.
        const target = new URL(APEX);
        target.pathname = pathname;
        target.search = search;
        return new Response(null, {
            status: 308,
            headers: {
                Location: target.href,
                "Strict-Transport-Security": "max-age=63072000",
            },
        });
    },
};

export default worker;
