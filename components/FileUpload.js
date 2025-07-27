import { processExcelData } from '../utils/dataProcessor.js';
import { getMostFrequentValue } from '../utils/dataFormatter.js';
import { showToast } from '../utils/toaster.js'; // Import the toaster utility

export class FileUpload {
    constructor(store, settings) {
        this.store = store;
        this.settings = settings; // Reference to Settings component
    }

    setup() {
        // Event listeners are set up in AppRunner.
        // Add listener to pre-fill dataset name when file is selected in modal
        document.getElementById('datasetFile')?.addEventListener('change', (e) => {
            const fileName = e.target.files[0]?.name || '';
            const datasetNameInput = document.getElementById('datasetName');
            // Only pre-fill if datasetName is currently empty, or if it's a new upload (not editing an existing file)
            if (!datasetNameInput.value || !this.settings.fileToUpdateId) { 
                datasetNameInput.value = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
            }
        });
    }

    async handleFileUpload(file) { // Sidebar upload always adds as a new scheme
        if (!file) return;

        try {
            const data = await this.readFileAsArrayBuffer(file);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawJson = XLSX.utils.sheet_to_json(sheet);
            const processedMembers = processExcelData(rawJson);
            
            // Generate a new unique ID for this scheme (file)
            const newFileId = Date.now().toString();

            // Determine the scheme name for sidebar upload: prioritize AGENT NAME, fallback to filename
            const derivedAgentName = getMostFrequentValue(processedMembers, 'agentName');
            const finalSchemeName = derivedAgentName || file.name.replace(/\.[^/.]+$/, "");

            // Add new scheme data in DataStore
            this.store.addOrUpdateSchemeData(newFileId, finalSchemeName, processedMembers);

            window.dispatchEvent(new CustomEvent('data:updated'));
            showToast('Dataset uploaded successfully!', 'success', 'Upload Success'); // Use toaster
        } catch (err) {
            console.error('Error processing file from sidebar:', err);
            showToast('Error processing file. Please check the file format and ensure it\'s a valid Excel file.', 'danger', 'Upload Error'); // Use toaster
        }
    }

    async handleModalUpload(file, datasetName, replaceExisting, fileIdToUpdate = null) {
        if (!datasetName) {
            showToast('Please provide a dataset name.', 'warning', 'Validation Error'); // Use toaster
            return;
        }

        const isEditMode = fileIdToUpdate !== null;
        let membersData = []; // This will hold the processed members array
        let finalSchemeName = datasetName; // Start with the name from the input field

        try {
            if (file) {
                // Scenario 1: A new file is provided (either for a brand new upload or to replace data of an existing scheme)
                const data = await this.readFileAsArrayBuffer(file);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rawJson = XLSX.utils.sheet_to_json(sheet);
                membersData = processExcelData(rawJson); // Process new file data

                // Determine scheme name from the new file's content (AGENT NAME)
                const derivedAgentName = getMostFrequentValue(membersData, 'agentName');
                if (derivedAgentName) {
                    finalSchemeName = derivedAgentName; // Prioritize AGENT NAME from new data
                } else if (!datasetName) {
                    // If no agent name in file and user didn't provide a name, use the file name
                    finalSchemeName = file.name.replace(/\.[^/.]+$/, "");
                }
                // Else (no derived agent name, but datasetName provided), finalSchemeName remains datasetName.

            } else if (isEditMode) {
                // Scenario 2: No new file is provided, it's a name-only edit for an existing scheme
                const existingScheme = this.store.schemesData.find(s => s.id === fileIdToUpdate);
                if (!existingScheme) {
                    throw new Error('Existing scheme not found for name-only update.');
                }
                membersData = existingScheme.members; // Keep existing member data
                // finalSchemeName is already `datasetName` (the name provided in the input field).
            } else {
                // Scenario 3: Neither a file nor an edit context (means a new upload without a file, which is invalid)
                showToast('Please select a file to upload a new dataset.', 'warning', 'Validation Error'); // Use toaster
                return;
            }

            // Determine the ID for storage: use existing ID if editing, otherwise generate new
            const targetFileId = isEditMode ? fileIdToUpdate : Date.now().toString();

            // Handle "Replace all existing" only if it's a brand new upload (not an edit of an existing file)
            if (replaceExisting && !isEditMode) {
                this.store.clearAll();
            }

            // Call DataStore with the final processed data and determined name
            // This will either add a new scheme or overwrite an existing one based on targetFileId
            this.store.addOrUpdateSchemeData(targetFileId, finalSchemeName, membersData);

            this.settings.uploadModal.hide(); // Hide the modal using the settings component reference
            window.dispatchEvent(new CustomEvent('data:updated'));
            showToast('Dataset updated successfully!', 'success', 'Upload Success'); // Use toaster

        } catch (err) {
            console.error('Error processing file from modal:', err);
            showToast('Error processing dataset: ' + (err.message || 'An unknown error occurred.'), 'danger', 'Upload Error'); // Use toaster
        }
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(new Uint8Array(e.target.result));
            reader.onerror = e => reject(e);
            reader.readAsArrayBuffer(file);
        });
    }
}