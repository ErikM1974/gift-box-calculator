let garmentRowCount = 0;

// Function to fetch garment data from our server API
async function fetchGarmentData(styleNumber) {
    try {
        const response = await fetch(`/api/garment/${styleNumber}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
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
    styleInput.placeholder = 'e.g., LST104';
    styleInput.addEventListener('blur', async function() {
        const garmentData = await fetchGarmentData(this.value);
        if (garmentData) {
            row.cells[1].querySelector('input').value = garmentData.description;
            row.cells[2].querySelector('input').value = garmentData.price;
        }
    });
    cell1.appendChild(styleInput);

    const cell2 = row.insertCell(1);
    cell2.innerHTML = '<input type="text" name="description" placeholder="Description">';

    const cell3 = row.insertCell(2);
    cell3.innerHTML = '<input type="number" name="price" min="0" step="0.01" placeholder="Price">';

    const cell4 = row.insertCell(3);
    cell4.innerHTML = '<button onclick="deleteGarmentRow(' + garmentRowCount + ')">Delete</button>';
}

function deleteGarmentRow(rowId) {
    const row = document.getElementById('garmentRow' + rowId);
    row.parentNode.removeChild(row);
}

async function toggleCapSection() {
    const capSection = document.getElementById('capSection');
    capSection.style.display = capSection.style.display === 'none' ? 'block' : 'none';
    
    if (capSection.style.display === 'block') {
        const capStyleInput = document.getElementById('capStyle');
        capStyleInput.addEventListener('blur', async function() {
            const capData = await fetchGarmentData(this.value);
            if (capData && capData.capPrice) {
                document.getElementById('capPrice').value = capData.capPrice;
            } else {
                document.getElementById('capPrice').value = '';
            }
        });
    } else {
        // Clear cap inputs when hiding the section
        document.getElementById('capStyle').value = '';
        document.getElementById('capPrice').value = '';
    }
}

function calculateTotal() {
    // ... (rest of the function remains unchanged)
}

function openModal() {
    // ... (unchanged)
}

function closeModal() {
    // ... (unchanged)
}

function downloadPDF() {
    // ... (unchanged)
}

// Initialize the calculator
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('gloveImage').addEventListener('click', openModal);
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Add initial garment row
    addGarmentRow();
});