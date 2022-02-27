document.addEventListener('DOMContentLoaded', () => {
	['term', 'terminal', 'starship']
		.flatMap(term => Array.from(document.getElementsByClassName(`language-${term}`)))
		.flatMap(lang => Array.from(lang.tagName == 'CODE' ? [lang] : lang.getElementsByTagName('code')))
		.forEach(code => code.innerHTML = code.innerHTML.replace(/(\s*)❯/g, '$1<span style="color: green">❯</span>'));
});
