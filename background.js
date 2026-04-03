// background.js - 搜索微信读书并解析结果

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'searchWeread') {
    var searchKeyword = request.keyword;
    if (request.author) {
      searchKeyword += ' ' + request.author;
    }
    var searchUrl = 'https://weread.qq.com/web/search/books?keyword=' + encodeURIComponent(searchKeyword);
    fetch(searchUrl, {
      method: 'GET',
      headers: { 'Accept': 'text/html' }
    })
    .then(function(resp) { return resp.text(); })
    .then(function(html) {
      var results = [];
      // 匹配每个搜索结果项
      var itemRe = /<li class="wr_bookList_item">([\s\S]*?)<\/li>/g;
      var itemMatch;
      while ((itemMatch = itemRe.exec(html)) !== null) {
        var itemHtml = itemMatch[1];
        // 提取 bookId（可能是 reader 或 bookDetail 链接）
        var idMatch = itemHtml.match(/href="\/web\/(?:reader|bookDetail)\/([^"]+)"/);
        if (!idMatch) continue;
        var bookId = idMatch[1];
        // 提取书名
        var titleMatch = itemHtml.match(/class="wr_bookList_item_title"[^>]*>([\s\S]*?)<\/p>/);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';
        // 提取作者
        var authorMatch = itemHtml.match(/class="wr_bookList_item_author"[\s\S]*?>([\s\S]*?)<\/p>/);
        var author = '';
        if (authorMatch) {
          var authorLinkMatch = authorMatch[1].match(/>([^<]+)<\/a>/);
          author = authorLinkMatch ? authorLinkMatch[1].trim() : authorMatch[1].replace(/<[^>]*>/g, '').trim();
        }
        if (title) {
          results.push({ bookId: bookId, title: title, author: author });
        }
      }
      sendResponse({ results: results });
    })
    .catch(function(err) {
      sendResponse({ results: [], error: err.message });
    });
    return true;
  }
});
