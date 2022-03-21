requirejs.config({
    appDir: ".",
    baseUrl: "js",
    paths: {
        'jquery': 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min',
        'bootstrap': 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min',
        'nerdamer' : 'https://cdn.jsdelivr.net/combine/npm/nerdamer@1.1.13,npm/nerdamer@1.1.13/Algebra.min',
        'katex' : 'https://cdn.jsdelivr.net/npm/katex@0.15.3/dist/katex.min',
        'katex-auto' : 'https://cdn.jsdelivr.net/npm/katex@0.15.3/dist/contrib/auto-render.min'
    },
    shim: {
        'bootstrap' : ['jquery']
    }
});

var renderMathOptions = {
    delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "\\[", right: "\\]", display: true},
        {left: "$", right: "$", display: false},
        {left: "\\(", right: "\\)", display: false}
    ]
};

function isFormVaild(form) {
    var isValid = true;
    form.find('.form-control').each(function(i, obj) {
        isValid &= $(this).hasClass('is-valid');
    });
    return isValid;
}

require(['jquery', 'bootstrap', 'nerdamer', 'katex', 'katex-auto'], function($, _, _, katex, renderMathInElement) {
    console.log("Loaded.");
    renderMathInElement(document.body, renderMathOptions);
    $(function() {
        var rootInput = $("#root-input");
        var startBtn = $("#start-btn");
        
        rootInput.keypress(function(event){
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if(keycode == '13') { // "Enter" key pressed
                startBtn.click();
            }
        });
        
        startBtn.click(function(event) {
            var polynomialInput = $("#polynomial-input");
            polynomialInput.removeClass("is-valid is-invalid");
            if (polynomialInput[0].checkValidity()) {
                try {
                    var value = polynomialInput.val();
                    if (value.includes('=')) {
                        polynomialInput.addClass('is-invalid');
                    } else {
                        var coeffs = nerdamer.coeffs(value, 'x');
                        polynomialInput.addClass('is-valid');
                    }
                } catch (e) {
                    polynomialInput.addClass('is-invalid');
                }
            } else {
                polynomialInput.addClass('is-invalid');
            }
            
            rootInput.removeClass("is-valid is-invalid");
            if (rootInput[0].checkValidity()) {
                try {
                    var rootVal = nerdamer(rootInput.val());
                    var symGroup = rootVal.symbol.group;
                    if (symGroup == 1 || ((symGroup == 3) && (rootVal.symbol.value == 'm'))) {
                        rootInput.addClass('is-valid');
                    } else {
                        rootInput.addClass('is-invalid');
                    }
                } catch (e) {
                    rootInput.addClass('is-invalid');
                }
            } else {
                rootInput.addClass('is-invalid');
            }
            
            if (isFormVaild($('#input-form'))) {
                var mainDiv = $('#main');
                mainDiv.empty();
                var tbody = $('<tbody>');
                var headRow = $('<tr>');
                headRow.append($('<th>').text("Bậc của $\\bm{f(x)}$"));
                var mononomialRow = $('<tr>');
                mononomialRow.append($('<th scope="row">').text("Hệ số $\\bm{f(x)}$"));
                
                var coeffsArr = [];
                coeffs.each(function (x) {
                    coeffsArr.unshift(x);
                });
                
                var factorRow = $('<tr>');
                factorRow.append($('<th scope="row">').text("$ \\alpha = " + rootVal + '$'));
                
                var degree = coeffsArr.length - 1;
                var currDeg = degree;
                var factorCoeff = null;
                var factorPoly = nerdamer(0);
                for (coeff of coeffsArr) {
                    col = $('<th>').addClass('text-center').text(currDeg);
                    headRow.append(col);  
                    
                    col = $('<td>').addClass('text-center');
                    col.text('$' + nerdamer(coeff).toTeX() + '$');
                    // katex.render(nerdamer(coeff).toTeX(), col[0]);
                    mononomialRow.append(col);  
                    
                    col = $('<td>').addClass('text-center');
                    if (factorCoeff !== null) {
                        factorCoeff = factorCoeff.multiply(rootVal).add(coeff)
                    } else {
                        factorCoeff = nerdamer(coeff);
                    }
                    col.text('$' + factorCoeff.toTeX() + '$');
                    factorRow.append(col);  
                    if (currDeg > 0) {
                        factorPoly = factorPoly.add(nerdamer(factorCoeff).multiply('x^' + (currDeg-1)).text());
                    }
                    --currDeg;
                }
                
                var table = $('<table>').addClass("table table-bordered py-3");
                tbody.append(mononomialRow);
                tbody.append(factorRow);
                mainDiv.append(table.append($('<thead>').append(headRow)).append(tbody));
                
                var factorPolyTex = factorPoly.multiply('(x-'+rootVal+')').add(factorCoeff).toTeX();
                var resultTex = '$' + nerdamer($("#polynomial-input").val()).toTeX() + '=' + factorPolyTex + '$';
                resultTex = resultTex.replaceAll("\\cdot", '');
                var result = $('<div>').addClass('p-3').text(resultTex);
                mainDiv.append(result);
                
                renderMathInElement(mainDiv[0], renderMathOptions);
            }
        });
    });
});