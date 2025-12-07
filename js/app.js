$(document).ready(function() {
    const $cakeGrid = $('#cake-products');
    let allCakesData = [];
    let cartData = [];
    let filteredCakes = [];

    // Function to render cakes into the grid
    function renderCakes(cakes) {
        $cakeGrid.empty();
        
        if (cakes.length === 0) {
            $cakeGrid.append('<p class="no-results">No cakes found matching your filters.</p>');
            return;
        }
        
        cakes.forEach(cake => {
            let badgesHtml = '<div class="cake-badges">';
            if (cake['3D']) badgesHtml += '<span class="badge badge-3d">🎨 3D Design Available</span>';
            if (cake.fondant === 'Yes') badgesHtml += '<span class="badge badge-fondant">🎪 Fondant Available</span>';
            if (cake.customized) badgesHtml += '<span class="badge badge-custom">✏️ Customizable</span>';
            if (cake.photoPrintable) badgesHtml += '<span class="badge badge-photo">📸 Photo Printable</span>';
            badgesHtml += '</div>';

            const cakeCardHtml = `
                <div class="cake-card" data-flavour="${cake.flavour}" data-type="${cake.type}" data-cake-id="${cake.id}">
                    <div class="cake-card-header">
                        <span class="product-code">Code: ${cake.productCode}</span>
                        <span class="cake-type">${cake.type}</span>
                    </div>
                    <img src="${cake.photo}" alt="${cake.name}" class="cake-img">
                    <div class="cake-card-info">
                        <h2>${cake.name}</h2>
                        <p class="description">${cake.description}</p>
                        <p class="base-price-card">From <strong>$${cake.options[0].price.toFixed(2)}</strong></p>
                        <button class="btn btn-outline-primary view-details-btn" data-cake-id="${cake.id}">View Details</button>
                    </div>
                </div>
            `;
            $cakeGrid.append(cakeCardHtml);
        });

        attachCakeEventListeners();
    }

    // Create cake details popup modal
    function createCakeDetailsModal(cake) {
        // Build shape selection section
        let shapeHtml = '<div class="shape-options">';
        shapeHtml += '<p class="shape-title"><strong>🎂 Choose Your Shape :</strong></p>';
        shapeHtml += '<div class="shape-container">';
        
        cake.shape.forEach((shape, shapeIndex) => {
            const shapeRadioId = `shape-${cake.id}-${shapeIndex}`;
            const isShapeChecked = shapeIndex === 0 ? 'checked' : '';
            shapeHtml += `
                <div class="shape-option">
                    <input type="radio" id="${shapeRadioId}" name="shape-${cake.id}" value="${shape}" ${isShapeChecked}>
                    <label for="${shapeRadioId}" class="shape-label">
                        <span class="shape-name">${shape}</span>
                    </label>
                </div>
            `;
        });
        
        shapeHtml += '</div></div>';

        // Build size selection section
        let optionsHtml = '<div class="size-shape-options">';
        optionsHtml += '<p class="options-title"><strong>📏 Choose Your Size :</strong></p>';
        optionsHtml += '<div class="options-container">';
        
        cake.options.forEach((option, index) => {
            const radioId = `size-${cake.id}-${index}`;
            const isChecked = index === 0 ? 'checked' : '';
            optionsHtml += `
                <div class="radio-option">
                    <input type="radio" id="${radioId}" name="size-${cake.id}" value="${option.size}" data-price="${option.price}" ${isChecked}>
                    <label for="${radioId}" class="option-label">
                        <div class="option-footer">
                          <span class="option-name">${option.size}</span>  <span class="option-price">$${option.price.toFixed(2)}</span>
                        </div>
                    </label>
                </div>
            `;
        });
        
        optionsHtml += '</div></div>';

        // Build add-ons section with dynamic pricing
        let addonsHtml = '<div class="addons-section">';
        addonsHtml += '<p class="addons-title"><strong>✨ Add-ons & Customization:</strong></p>';
        addonsHtml += '<div class="addons-container">';
        
        const firstOptionAddons = cake.options[0].addons;

        if (cake['3D'] && firstOptionAddons['3D_addon'] > 0) {
            const addon3DPrice = firstOptionAddons['3D_addon'];
            addonsHtml += `
                <div class="addon-option">
                    <input type="checkbox" class="addon-checkbox" id="addon-3d-${cake.id}" 
                           data-addon="3D Design" data-cake-id="${cake.id}">
                    <label for="addon-3d-${cake.id}" class="addon-label">
                        <span class="addon-name">🎨 3D Design</span>
                        <span class="addon-price addon-price-dynamic">+$${addon3DPrice.toFixed(2)}</span>
                    </label>
                </div>
            `;
        }

        if (cake.fondant === 'Yes' && firstOptionAddons['fondant_addon'] > 0) {
            const addonFondantPrice = firstOptionAddons['fondant_addon'];
            addonsHtml += `
                <div class="addon-option">
                    <input type="checkbox" class="addon-checkbox" id="addon-fondant-${cake.id}" 
                           data-addon="Fondant Coating" data-cake-id="${cake.id}">
                    <label for="addon-fondant-${cake.id}" class="addon-label">
                        <span class="addon-name">🎪 Fondant Coating</span>
                        <span class="addon-price addon-price-dynamic">+$${addonFondantPrice.toFixed(2)}</span>
                    </label>
                </div>
            `;
        }

        // Add Photo Addon
        const addonPhotoPrice = firstOptionAddons['photo_addon'] || 5.00;
        if (cake.photoPrintable) {
            addonsHtml += `
                <div class="addon-option">
                    <input type="checkbox" class="addon-checkbox" id="addon-photo-${cake.id}" 
                           data-addon="Photo Print on Cake" data-cake-id="${cake.id}">
                    <label for="addon-photo-${cake.id}" class="addon-label">
                        <span class="addon-name">📸 Photo Print on Cake</span>
                        <span class="addon-price addon-price-dynamic">+$${addonPhotoPrice.toFixed(2)}</span>
                    </label>
                </div>
            `;
        }

        if (cake.tier && cake.tier.length > 0) {
            addonsHtml += `
                <div class="addon-option tier-option">
                    <label for="tier-${cake.id}" class="tier-label">
                        <span class="tier-name">🏢 Number of Tiers:</span>
                    </label>
                    <select id="tier-${cake.id}" class="tier-select" data-cake-id="${cake.id}">
                        <option value="">-- Select Tier --</option>
            `;
            cake.tier.forEach(tier => {
                addonsHtml += `<option value="${tier}">${tier}</option>`;
            });
            addonsHtml += `
                    </select>
                </div>
            `;
        }

        addonsHtml += '</div></div>';

        // Pricing display with breakdown
        let pricingHtml = `
            <div class="pricing-summary">
                <div class="price-breakdown">
                    <div class="price-row base-row">
                        <span class="price-label">📌 Base Price:</span>
                        <span class="price-value base-price">$<span class="base-price-${cake.id}">${cake.options[0].price.toFixed(2)}</span></span>
                    </div>
                    <div class="addon-prices-breakdown" id="addon-breakdown-${cake.id}"></div>
                    <div class="price-row total-row">
                        <span class="price-label"><strong>💰 Total Price:</strong></span>
                        <span class="price-value total"><strong>$<span class="total-price-${cake.id}">${cake.options[0].price.toFixed(2)}</span></strong></span>
                    </div>
                </div>
            </div>
        `;

        let badgesHtml = '<div class="cake-badges">';
        if (cake['3D']) badgesHtml += '<span class="badge badge-3d">🎨 3D Design Available</span>';
        if (cake.fondant === 'Yes') badgesHtml += '<span class="badge badge-fondant">🎪 Fondant Available</span>';
        if (cake.customized) badgesHtml += '<span class="badge badge-custom">✏️ Customizable</span>';
        if (cake.photoPrintable) badgesHtml += '<span class="badge badge-photo">📸 Photo Printable</span>';
        badgesHtml += '</div>';

        const cakeDetailsModalHtml = `
            <div class="modal fade" id="cakeDetailsModal-${cake.id}" tabindex="-1" aria-labelledby="cakeDetailsModalLabel-${cake.id}" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-fullscreen-sm-down">
                    <div class="modal-content">
                        <div class="modal-header">
                            <div class="modal-header-info">
                                <h5 class="modal-title" id="cakeDetailsModalLabel-${cake.id}">${cake.name}</h5>
                                <p class="modal-flavour"><strong>Flavour:</strong> <span class="flavour-tag">${cake.flavour}</span></p>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="cake-details-modal-content">
                                <div class="cake-image-section">
                                    <img src="${cake.photo}" alt="${cake.name}" class="cake-details-img">
                                    ${badgesHtml}
                                </div>
                                <div class="cake-options-section">
                                    <p class="description"><strong>Description:</strong> ${cake.description}</p>
                                    
                                    ${shapeHtml}
                                    ${optionsHtml}
                                    ${addonsHtml}
                                    ${pricingHtml}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-success add-to-cart-modal" data-cake-id="${cake.id}">Add to Cart</button>
                            <button type="button" class="btn btn-primary order-now-modal" data-cake-id="${cake.id}">Order Now</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('body').append(cakeDetailsModalHtml);
    }

    // Create filter and sort modal
    function createFilterModal() {
        const filterModalHtml = `
            <div class="modal fade" id="filterSortModal" tabindex="-1" aria-labelledby="filterSortModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-fullscreen-sm-down">
                    <div class="modal-content filter-bg">
                        <div class="modal-header">
                            <h5 class="modal-title" id="filterSortModalLabel">🔍 Filters & Sort</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body filter-modal-body">
                            <div class="filter-group">
                                <label for="type-filter"><strong>🎂 Cake Type:</strong></label>
                                <select id="type-filter" class="form-select">
                                    <option value="all">All Types</option>
                                </select>
                            </div>

                            <div class="filter-group">
                                <label for="flavour-filter"><strong>🍓 Flavour:</strong></label>
                                <select id="flavour-filter" class="form-select">
                                    <option value="all">All Flavours</option>
                                </select>
                            </div>

                            <div class="filter-group">
                                <label for="shape-filter"><strong>🎀 Shape:</strong></label>
                                <select id="shape-filter" class="form-select">
                                    <option value="all">All Shapes</option>
                                </select>
                            </div>

                            <div class="filter-group">
                                <label for="tier-filter"><strong>🏢 Tier:</strong></label>
                                <select id="tier-filter" class="form-select">
                                    <option value="all">All Tiers</option>
                                </select>
                            </div>

                            <div class="filter-group">
                                <label for="sort-filter"><strong>📊 Sort By:</strong></label>
                                <select id="sort-filter" class="form-select">
                                    <option value="">None</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name-asc">Name: A to Z</option>
                                    <option value="name-desc">Name: Z to A</option>
                                </select>
                            </div>

                            <div class="filter-group filter-checkboxes">
                                <label><strong>✨ Features:</strong></label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="3d-filter">
                                    <label class="form-check-label" for="3d-filter">🎨 3D Design Available</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="fondant-filter">
                                    <label class="form-check-label" for="fondant-filter">🎪 Fondant Available</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="customized-filter">
                                    <label class="form-check-label" for="customized-filter">✏️ Customizable</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="photo-printable-filter">
                                    <label class="form-check-label" for="photo-printable-filter">📸 Photo Printable</label>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="reset-filters-btn">Reset Filters</button>
                            <button type="button" class="btn btn-primary" id="apply-filters-btn" data-bs-dismiss="modal">Apply</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(filterModalHtml);
    }

    // Attach event listeners to cake cards
    function attachCakeEventListeners() {
        // Handle shape radio button changes
        $(document).on('change', 'input[name^="shape-"]', function() {
            const cakeId = $(this).attr('name').split('-')[1];
        });

        // Handle size radio button changes
        $(document).on('change', 'input[name^="size-"]', function() {
            const cakeId = $(this).attr('name').split('-')[1];
            updatePriceDisplay(cakeId);
            updateAddonPrices(cakeId);
        });

        // Handle addon checkbox changes
        $(document).on('change', '.addon-checkbox', function() {
            const cakeId = $(this).data('cake-id');
            updatePriceDisplay(cakeId);
        });

        // Handle tier selection changes
        $(document).on('change', '.tier-select', function() {
            const cakeId = $(this).data('cake-id');
            updatePriceDisplay(cakeId);
        });

        // Handle view details button click
        $(document).on('click', '.view-details-btn', function(e) {
            e.preventDefault();
            const cakeId = $(this).data('cake-id');
            const cake = allCakesData.find(c => c.id === cakeId);
            
            // Remove existing modal if any
            $(`#cakeDetailsModal-${cakeId}`).remove();
            
            // Create and show new modal
            createCakeDetailsModal(cake);
            const detailsModal = new bootstrap.Modal(document.getElementById(`cakeDetailsModal-${cakeId}`));
            detailsModal.show();
        });
    }

    // Update addon prices when size changes
    function updateAddonPrices(cakeId) {
        const cake = allCakesData.find(c => c.id == cakeId);
        const selectedSize = $(`input[name="size-${cakeId}"]:checked`).val();
        const selectedOption = cake.options.find(opt => opt.size === selectedSize) || cake.options[0];
        const addonPrices = selectedOption.addons;

        // Update 3D Design price display
        if (addonPrices['3D_addon'] > 0) {
            $(`#addon-3d-${cakeId}`).next('label').find('.addon-price-dynamic').text(`+$${addonPrices['3D_addon'].toFixed(2)}`);
        }

        // Update Fondant Coating price display
        if (addonPrices['fondant_addon'] > 0) {
            $(`#addon-fondant-${cakeId}`).next('label').find('.addon-price-dynamic').text(`+$${addonPrices['fondant_addon'].toFixed(2)}`);
        }

        // Update Photo Print price display
        if (addonPrices['photo_addon'] > 0) {
            $(`#addon-photo-${cakeId}`).next('label').find('.addon-price-dynamic').text(`+$${addonPrices['photo_addon'].toFixed(2)}`);
        }
    }

    // Update price display based on selections
    function updatePriceDisplay(cakeId) {
        const cake = allCakesData.find(c => c.id == cakeId);
        let basePrice = cake.options[0].price;
        let totalPrice = basePrice;
        let addonBreakdown = '';
        let selectedOption = cake.options[0];

        // Get selected size price and its addons
        const selectedSize = $(`input[name="size-${cakeId}"]:checked`).val();
        if (selectedSize) {
            selectedOption = cake.options.find(opt => opt.size === selectedSize);
            basePrice = selectedOption.price;
            totalPrice = basePrice;
        }

        // Get addon prices from the selected size option
        const addonPrices = selectedOption.addons;

        // Calculate addon prices based on selected size
        $(`#addon-3d-${cakeId}, #addon-fondant-${cakeId}, #addon-photo-${cakeId}`).each(function() {
            if ($(this).is(':checked')) {
                const addonKey = $(this).attr('id').replace('addon-', '').replace(`-${cakeId}`, '') + '_addon';
                const addonPrice = addonPrices[addonKey] || 0;
                const addonName = $(this).data('addon');
                totalPrice += addonPrice;
                addonBreakdown += `<div class="price-row addon-price-row"><span class="addon-breakdown-name">${addonName}:</span> <span class="addon-breakdown-price">+$${addonPrice.toFixed(2)}</span></div>`;
            }
        });

        // Update display
        $(`.base-price-${cakeId}`).text(basePrice.toFixed(2));
        $(`#addon-breakdown-${cakeId}`).html(addonBreakdown);
        $(`.total-price-${cakeId}`).text(totalPrice.toFixed(2));
    }

    // Function to populate filter dropdowns
    function populateFilters() {
        const types = [...new Set(allCakesData.map(cake => cake.type))];
        const shapes = [...new Set(allCakesData.flatMap(cake => cake.shape))];
        const tiers = [...new Set(allCakesData.flatMap(cake => cake.tier))];
        const flavours = [...new Set(allCakesData.map(cake => cake.flavour))];

        const $typeFilter = $('#type-filter');
        types.forEach(type => {
            $typeFilter.append(`<option value="${type}">${type}</option>`);
        });

        const $shapeFilter = $('#shape-filter');
        shapes.forEach(shape => {
            $shapeFilter.append(`<option value="${shape}">${shape}</option>`);
        });

        const $tierFilter = $('#tier-filter');
        tiers.forEach(tier => {
            $tierFilter.append(`<option value="${tier}">${tier}</option>`);
        });

        const $flavourFilter = $('#flavour-filter');
        flavours.forEach(flavour => {
            $flavourFilter.append(`<option value="${flavour}">${flavour}</option>`);
        });
    }

    // Function to apply all filters
    function applyFilters() {
        const selectedType = $('#type-filter').val();
        const selectedShape = $('#shape-filter').val();
        const selectedTier = $('#tier-filter').val();
        const selected3D = $('#3d-filter').prop('checked');
        const selectedFondant = $('#fondant-filter').prop('checked');
        const selectedCustom = $('#customized-filter').prop('checked');
        const selectedPhotoPrintable = $('#photo-printable-filter').prop('checked');
        const selectedFlavour = $('#flavour-filter').val();
        const sortBy = $('#sort-filter').val();

        filteredCakes = allCakesData.filter(cake => {
            const matchType = selectedType === 'all' || cake.type === selectedType;
            const matchShape = selectedShape === 'all' || cake.shape.includes(selectedShape);
            const matchTier = selectedTier === 'all' || cake.tier.includes(selectedTier);
            const match3D = !selected3D || cake['3D'] === true;
            const matchFondant = !selectedFondant || cake.fondant === 'Yes';
            const matchCustom = !selectedCustom || cake.customized === true;
            const matchPhotoPrintable = !selectedPhotoPrintable || cake.photoPrintable === true;
            const matchFlavour = selectedFlavour === 'all' || cake.flavour === selectedFlavour;

            return matchType && matchShape && matchTier && match3D && matchFondant && matchCustom && matchPhotoPrintable && matchFlavour;
        });

        if (sortBy === 'price-low') {
            filteredCakes.sort((a, b) => a.options[0].price - b.options[0].price);
        } else if (sortBy === 'price-high') {
            filteredCakes.sort((a, b) => b.options[0].price - a.options[0].price);
        } else if (sortBy === 'name-asc') {
            filteredCakes.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'name-desc') {
            filteredCakes.sort((a, b) => b.name.localeCompare(a.name));
        }

        renderCakes(filteredCakes);
    }

    // Function to reset all filters
    function resetFilters() {
        $('#type-filter').val('all');
        $('#shape-filter').val('all');
        $('#tier-filter').val('all');
        $('#flavour-filter').val('all');
        $('#sort-filter').val('');
        $('#3d-filter').prop('checked', false);
        $('#fondant-filter').prop('checked', false);
        $('#customized-filter').prop('checked', false);
        $('#photo-printable-filter').prop('checked', false);
        applyFilters();
    }

    // Function to update cart display and show modal
    function updateCartDisplay() {
        const $cartCount = $('#cart-count');
        $cartCount.text(cartData.length);

        const groupedCart = {};
        cartData.forEach((item, idx) => {
            const key = `${item.id}-${item.shape}-${item.size}-${item.addons.join('|')}`;
            if (!groupedCart[key]) {
                groupedCart[key] = { ...item, qty: 0, cartIndex: idx };
            }
            groupedCart[key].qty++;
        });

        let modalHtml = `
            <div class="modal fade" id="cartModal" tabindex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="cartModalLabel">🛒 Shopping Cart</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="cart-modal-items">
        `;

        if (cartData.length === 0) {
            modalHtml += '<p class="empty-cart-msg">Your cart is empty</p>';
        } else {
            let total = 0;
            Object.entries(groupedCart).forEach(([key, item], index) => {
                const itemTotal = item.price * item.qty;
                total += itemTotal;
                
                let addonsDisplay = '';
                if (item.addons && item.addons.length > 0) {
                    addonsDisplay += '<p><strong>✨ Add-ons:</strong></p><ul class="addons-list">';
                    item.addons.forEach(addon => {
                        const addonPrice = item.addonsPrices[addon] || 0;
                        addonsDisplay += `<li>${addon} (+$${addonPrice.toFixed(2)})</li>`;
                    });
                    addonsDisplay += '</ul>';
                }

                modalHtml += `
                    <div class="cart-modal-item">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p><strong>🎂 Shape:</strong> <span class="shape-detail">${item.shape}</span></p>
                            <p><strong>📏 Size:</strong> <span class="size-detail">${item.size}</span></p>
                            ${addonsDisplay}
                            <p><strong>🏢 Tier:</strong> ${item.tier || 'Standard'}</p>
                            <div class="pricing-details">
                                <p><strong>Base Price:</strong> <span class="base-price-detail">$${item.basePrice.toFixed(2)}</span></p>
                                <p><strong>Price per item:</strong> <span class="item-price-detail">$${item.price.toFixed(2)}</span></p>
                            </div>
                        </div>
                        <div class="item-qty">
                            <label>Qty: <span class="qty-badge">${item.qty}</span></label>
                            <div class="qty-controls">
                                <button class="qty-btn qty-decrease" data-cart-key="${key}">−</button>
                                <button class="qty-btn qty-increase" data-cart-key="${key}">+</button>
                            </div>
                        </div>
                        <div class="item-total">
                            <p><strong>Total:</strong> <span class="item-total-amount">$${itemTotal.toFixed(2)}</span></p>
                            <button class="remove-item-btn" data-cart-key="${key}">Remove</button>
                        </div>
                    </div>
                `;
            });

            modalHtml += `
                            </div>
                            <div class="cart-modal-summary">
                                <h5>📋 Cart Summary</h5>
                                <p><strong>Total Items:</strong> ${cartData.length}</p>
                                <p><strong>Total Price:</strong> <span class="cart-total-price">$${total.toFixed(2)}</span></p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Continue Shopping</button>
                            <button type="button" class="btn btn-danger" id="clear-cart-modal-btn">Clear Cart</button>
                            <button type="button" class="btn btn-success" id="place-order-btn">Place Order</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }

        $('#cartModal').remove();
        $('body').append(modalHtml);

        const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
        cartModal.show();
    }

    // Load data from cakes.json
    $.getJSON('https://raw.githubusercontent.com/tejpatamenu/menu/refs/heads/main/cakes.json', function(data) {
        allCakesData = data;
        createFilterModal();
        populateFilters();
        renderCakes(allCakesData);
    }).fail(function(jqxhr, textStatus, error) {
        const err = textStatus + ", " + error;
        console.log("Request Failed: " + err);
        $cakeGrid.append('<p>Sorry, the cake data could not be loaded.</p>');
    });

    // Handle filter/sort modal open
    $(document).on('click', '#filter-btn, .filter-icon, .sort-icon', function() {
        const filterModal = new bootstrap.Modal(document.getElementById('filterSortModal'));
        filterModal.show();
    });

    // Handle apply filters button
    $(document).on('click', '#apply-filters-btn', function() {
        applyFilters();
    });

    // Handle reset filters
    $(document).on('click', '#reset-filters-btn', function() {
        resetFilters();
    });

    // Handle Add to Cart button click from details modal
    $(document).on('click', '.add-to-cart-modal', function() {
        const cakeId = $(this).data('cake-id');
        const cake = allCakesData.find(c => c.id === cakeId);
        
        const selectedShape = $(`input[name="shape-${cakeId}"]:checked`).val();
        if (!selectedShape) {
            alert('Please select a shape!');
            return;
        }

        const selectedSize = $(`input[name="size-${cakeId}"]:checked`).val();
        if (!selectedSize) {
            alert('Please select a size!');
            return;
        }

        const selectedOption = cake.options.find(opt => opt.size === selectedSize);
        let totalPrice = selectedOption.price;
        let selectedAddons = [];
        let selectedAddonsPrices = {};

        $(`#addon-3d-${cakeId}, #addon-fondant-${cakeId}, #addon-photo-${cakeId}`).each(function() {
            if ($(this).is(':checked')) {
                const addonKey = $(this).attr('id').replace('addon-', '').replace(`-${cakeId}`, '') + '_addon';
                const addonPrice = selectedOption.addons[addonKey] || 0;
                const addonName = $(this).data('addon');
                selectedAddons.push(addonName);
                selectedAddonsPrices[addonName] = addonPrice;
                totalPrice += addonPrice;
            }
        });

        const selectedTier = $(`#tier-${cakeId}`).val();

        const cartItem = {
            id: cake.id,
            name: cake.name,
            flavour: cake.flavour,
            shape: selectedShape,
            size: selectedSize,
            price: totalPrice,
            addons: selectedAddons,
            addonsPrices: selectedAddonsPrices,
            tier: selectedTier || 'Standard',
            basePrice: selectedOption.price
        };

        cartData.push(cartItem);
        $('#cart-count').text(cartData.length);
        
        let addonsText = selectedAddons.length > 0 ? ` with ${selectedAddons.join(', ')}` : '';
        alert(`✅ ${cake.name} (${selectedShape}, ${selectedSize})${addonsText} has been added to your cart!\n\nPrice: $${totalPrice.toFixed(2)}`);
        
        // Close the details modal
        $(`#cakeDetailsModal-${cakeId}`).modal('hide');
    });

    // Handle Order Now button click from details modal
    $(document).on('click', '.order-now-modal', function() {
        const cakeId = $(this).data('cake-id');
        const cake = allCakesData.find(c => c.id === cakeId);
        
        const selectedShape = $(`input[name="shape-${cakeId}"]:checked`).val();
        if (!selectedShape) {
            alert('Please select a shape!');
            return;
        }

        const selectedSize = $(`input[name="size-${cakeId}"]:checked`).val();
        if (!selectedSize) {
            alert('Please select a size!');
            return;
        }

        alert(`Proceeding to checkout for ${cake.name}!`);
    });

    // Handle Cart Toggle
    $(document).on('click', '#cart-toggle', function() {
        updateCartDisplay();
    });

    // Handle Increase Quantity
    $(document).on('click', '.qty-increase', function() {
        const cartKey = $(this).data('cart-key');
        const [cakeId, shape, size, addonsStr] = cartKey.split('-');
        
        const matchingItem = cartData.find(item => 
            item.id == cakeId && 
            item.shape === shape &&
            item.size === size &&
            item.addons.join('|') === addonsStr
        );

        if (matchingItem) {
            const newItem = { ...matchingItem };
            cartData.push(newItem);
            updateCartDisplay();
        }
    });

    // Handle Decrease Quantity
    $(document).on('click', '.qty-decrease', function() {
        const cartKey = $(this).data('cart-key');
        const [cakeId, shape, size, addonsStr] = cartKey.split('-');
        
        const index = cartData.findIndex(item => 
            item.id == cakeId && 
            item.shape === shape &&
            item.size === size &&
            item.addons.join('|') === addonsStr
        );

        if (index > -1) {
            cartData.splice(index, 1);
            updateCartDisplay();
        }
    });

    // Handle Remove Item
    $(document).on('click', '.remove-item-btn', function() {
        const cartKey = $(this).data('cart-key');
        const [cakeId, shape, size, addonsStr] = cartKey.split('-');
        
        cartData = cartData.filter(item => !(
            item.id == cakeId && 
            item.shape === shape &&
            item.size === size &&
            item.addons.join('|') === addonsStr
        ));
        
        $('#cart-count').text(cartData.length);
        updateCartDisplay();
    });

    // Handle Clear Cart
    $(document).on('click', '#clear-cart-modal-btn', function() {
        if (confirm('Are you sure you want to clear your cart?')) {
            cartData = [];
            $('#cart-count').text(0);
            updateCartDisplay();
        }
    });

    // Handle Place Order
    $(document).on('click', '#place-order-btn', function() {
        if (cartData.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        let total = 0;
        let orderSummary = '*ORDER SUMMARY*\n';
        orderSummary += '═══════════════════════════════════════\n\n';
        
        cartData.forEach((item, idx) => {
            total += item.price;
            let addonsText = '';
            if (item.addons && item.addons.length > 0) {
                addonsText = '\n  ✨ Add-ons:\n';
                item.addons.forEach(addon => {
                    const addonPrice = item.addonsPrices[addon] || 0;
                    addonsText += `    • ${addon}: +$${addonPrice.toFixed(2)}\n`;
                });
            }
            let tierText = item.tier && item.tier !== 'Standard' ? `\n  🏢 Tier: ${item.tier}` : '';
            orderSummary += `${idx + 1}. *${item.name}*\n`;
            orderSummary += `   🎂 Shape: ${item.shape}\n`;
            orderSummary += `   📏 Size: ${item.size}\n`;
            orderSummary += `   💰 Base Price: $${item.basePrice.toFixed(2)}${addonsText}${tierText}\n`;
            orderSummary += `   💵 Item Total: $${item.price.toFixed(2)}\n\n`;
        });

        orderSummary += '═══════════════════════════════════════\n';
        orderSummary += `*TOTAL AMOUNT: $${total.toFixed(2)}*\n`;
        orderSummary += '═══════════════════════════════════════\n\n';
        orderSummary += `Thank you for your order! 🎂\n`;
        orderSummary += `Please contact us to confirm.`;
        
        const whatsappNumber = '14379377563';
        const encodedMessage = encodeURIComponent(orderSummary);
        
        const whatsappUrl = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
        const whatsappMobileUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            window.open(whatsappMobileUrl, '_blank');
        } else {
            window.open(whatsappUrl, '_blank');
        }
        
        cartData = [];
        $('#cart-count').text(0);
        $('#cartModal').modal('hide');
    });
});
