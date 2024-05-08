plugins: [
  function(hook, vm) {
    hook.beforeEach(function(content) {
      // 对于markdown文件中以"[PDF"开头的行，用PDF.js嵌入PDF查看器
      content = content.replace(/\[PDF\s(.+)\]/g, (_, url) => {
        return `<div class="pdf-container">
                    <div class="pdf-loader">Loading pdf...</div>
                    <div class="pdf-contents">
                        <canvas></canvas>
                    </div>
                </div>
                <script>
                    const url = "${url}";
                    pdfjsLib.getDocument(url).promise.then(function(pdf) {
                        const scale = 1.5;
                        const canvas = document.querySelector(".pdf-container canvas");
                        const context = canvas.getContext("2d");
                        const viewport = pdf.getPage(1).getViewport({scale: scale});
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        pdf.getPage(1).render({
                            canvasContext: context,
                            viewport: viewport
                        });
                        document.querySelector(".pdf-loader").style.display = "none";
                        document.querySelector(".pdf-contents").style.display = "block";
                    });
                </script>`
      });
      return content;
    });
  }
]