let garmentRowCount = 0;

async function fetchGarmentData(styleNumber) {
    console.log(`Fetching data for style number: ${styleNumber}`);
    try {
        const response = await fetch(`/api/garment/${styleNumber}`);
        console.log(`Response status: ${response.status}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function addGarmentRow() {
    garmentRowCount++;
    const table = document.getElementById('garmentTable');
    const row = table.insertRow();
    row.setAttribute('id', 'garmentRow' + garmentRowCount);

    const cell1 = row.insertCell(0);
    const styleInput = document.createElement('input');
    styleInput.type = 'text';
    styleInput.name = 'styleNumber';
    styleInput.placeholder = 'e.g., CT100617';
    cell1.appendChild(styleInput);

    const cell2 = row.insertCell(1);
    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.name = 'description';
    descriptionInput.placeholder = 'Description';
    descriptionInput.readOnly = true;
    cell2.appendChild(descriptionInput);

    const cell3 = row.insertCell(2);
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.name = 'price';
    priceInput.min = '0';
    priceInput.step = '0.01';
    priceInput.placeholder = 'Price';
    priceInput.readOnly = true;
    cell3.appendChild(priceInput);

    const cell4 = row.insertCell(3);
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => deleteGarmentRow(garmentRowCount);
    cell4.appendChild(deleteButton);

    styleInput.addEventListener('blur', async function() {
        if (this.value.trim() === '') {
            alert('Please enter a valid style number.');
            return;
        }
        console.log(`Attempting to fetch data for style number: ${this.value}`);
        const garmentData = await fetchGarmentData(this.value);
        if (garmentData) {
            console.log('Successfully fetched garment data:', garmentData);
            descriptionInput.value = garmentData.description;
            priceInput.value = garmentData.price;
        } else {
            console.error('Failed to fetch garment data');
            alert('Unable to fetch garment data. Please check the style number and try again.');
            this.value = '';
        }
    });
}

function deleteGarmentRow(rowId) {
    const row = document.getElementById('garmentRow' + rowId);
    row.parentNode.removeChild(row);
}

function toggleCapSection() {
    const capSection = document.getElementById('capSection');
    capSection.style.display = capSection.style.display === 'none' ? 'block' : 'none';
}

async function fetchCapData(styleNumber) {
    console.log(`Fetching cap data for style number: ${styleNumber}`);
    const garmentData = await fetchGarmentData(styleNumber);
    if (garmentData && garmentData.capPrice) {
        console.log('Successfully fetched cap data:', garmentData);
        document.getElementById('capPrice').value = garmentData.capPrice;
    } else {
        console.error('Failed to fetch cap data');
        alert('Unable to fetch cap price. Please enter the price manually.');
    }
}

async function calculateTotal() {
    const numberOfBoxes = parseInt(document.getElementById('numberOfBoxes').value) || 0;
    if (numberOfBoxes <= 0) {
        alert('Please enter a valid number of gift boxes.');
        return;
    }

    // Calculate garment costs
    const garmentRows = document.querySelectorAll('#garmentTable tr:not(:first-child)');
    let totalGarmentCostPerBox = 0;
    let itemizedCostsHTML = [];
    let builtInFeesPerBox = 8.00; // $8.00 built-in fees per box
    const numberOfGarments = garmentRows.length;

    if (numberOfGarments === 0) {
        alert('Please add at least one garment with a valid price.');
        return;
    }

    const builtInFeesPerGarment = builtInFeesPerBox / numberOfGarments;

    for (let i = 0; i < numberOfGarments; i++) {
        const row = garmentRows[i];
        const styleNumber = row.querySelector('input[name="styleNumber"]').value || '';
        const description = row.querySelector('input[name="description"]').value || '';
        const priceInput = row.querySelector('input[name="price"]');
        const price = parseFloat(priceInput.value) || 0;

        if (price > 0) {
            const adjustedPrice = price + builtInFeesPerGarment;
            itemizedCostsHTML.push('<tr><td>' + styleNumber + '</td><td>' + description + '</td><td class="right-align">$' + adjustedPrice.toFixed(2) + '</td></tr>');
            totalGarmentCostPerBox += adjustedPrice;
        } else {
            alert('Please enter a valid price for garment ' + (i + 1) + '.');
            return;
        }
    }

    // Cap cost
    let capCostPerBox = 0;
    if (document.getElementById('includeCap').checked) {
        const capStyle = document.getElementById('capStyle').value || '';
        const capPrice = parseFloat(document.getElementById('capPrice').value) || 0;
        if (capPrice > 0) {
            capCostPerBox = capPrice;
            itemizedCostsHTML.push('<tr><td>' + capStyle + '</td><td>Embroidered Cap</td><td class="right-align">$' + capCostPerBox.toFixed(2) + '</td></tr>');
        } else {
            alert('Please enter a valid cap price.');
            return;
        }
    }

    // Include gloves in itemized list at $0.00 (only once per box)
    itemizedCostsHTML.push('<tr><td>CTGD0794</td><td>Carhartt High-Dexterity Open-Cuff Glove</td><td class="right-align">$0.00 <small>(Retail: $19.00)</small></td></tr>');

    // Calculate subtotal before fees
    const subtotalBeforeFees = totalGarmentCostPerBox + capCostPerBox;

    // Packaging & Handling per box
    const packagingHandling = 8.00;

    // Subtotal per box before discount
    const subtotalPerBox = subtotalBeforeFees + packagingHandling;

    // Determine applicable discount
    let discountRate = 0;
    if (numberOfBoxes >= 100) {
        discountRate = 15;
    } else if (numberOfBoxes >= 50) {
        discountRate = 10;
    } else if (numberOfBoxes >= 10) {
        discountRate = 5;
    }

    // Calculate discount amount per box
    const discountAmountPerBox = (subtotalPerBox * discountRate) / 100;

    // Total cost per box after discount
    const totalCostPerBox = subtotalPerBox - discountAmountPerBox;

    // Total order cost
    const totalOrderCost = totalCostPerBox * numberOfBoxes;

    // Total value of free gloves
    const totalGlovesValue = numberOfBoxes * 19.00;

    // Display results
    document.getElementById('summaryNumberOfBoxes').innerText = numberOfBoxes;
    document.getElementById('summaryNumberOfBoxes2').innerText = numberOfBoxes;
    document.getElementById('itemizedCosts').innerHTML = itemizedCostsHTML.join('');
    document.getElementById('subtotalBeforeFees').innerText = subtotalBeforeFees.toFixed(2);
    document.getElementById('summaryPackagingHandling').innerText = packagingHandling.toFixed(2);
    document.getElementById('summarySubtotal').innerText = subtotalPerBox.toFixed(2);
    document.getElementById('summaryDiscountRate').innerText = discountRate > 0 ? discountRate + '%' : 'No discount';
    document.getElementById('summaryDiscountAmount').innerText = discountAmountPerBox.toFixed(2);
    document.getElementById('summaryTotalCost').innerText = totalCostPerBox.toFixed(2);
    document.getElementById('summaryTotalCost2').innerText = totalCostPerBox.toFixed(2);
    document.getElementById('summaryTotalOrderCost').innerText = totalOrderCost.toFixed(2);
    document.getElementById('totalGlovesValue').innerText = totalGlovesValue.toFixed(2);

    document.getElementById('resultSection').style.display = 'block';
}

// Modal functionality
const modal = document.getElementById('myModal');
const img = document.getElementById('gloveImage');
const modalImg = document.getElementById('imgModal');
const captionText = document.getElementById('caption');

img.onclick = function() {
    modal.style.display = 'block';
    modalImg.src = this.src;
    captionText.innerHTML = 'Carhartt High-Dexterity Open-Cuff Glove';
};

function closeModal() {
    modal.style.display = 'none';
}

function downloadPDF() {
    // Get the content to be converted to PDF
    const element = document.getElementById('resultSection');

    // Options for html2pdf
    const opt = {
        margin:       0.5,
        filename:     'Gift_Box_Quote.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Hide the Download button before generating PDF
    const downloadBtn = document.querySelector('.download-btn');
    downloadBtn.style.display = 'none';

    // Generate and download the PDF
    html2pdf().set(opt).from(element).save().then(() => {
        // Show the Download button again after PDF is generated
        downloadBtn.style.display = 'block';
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    addGarmentRow();
    
    // Add event listener for cap style number input
    const capStyleInput = document.getElementById('capStyle');
    capStyleInput.addEventListener('blur', function() {
        if (this.value.trim() !== '') {
            fetchCapData(this.value);
        }
    });
});