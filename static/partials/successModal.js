document.write(`<!-- Modal -->
                <div class="modal fade" id="success_modal" tabindex="-1" aria-labelledby="success_modal_title" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="success_modal_title">Successo</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        <div class="modal-body">
                            <p id="success_modal_body">
                            </p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-success" data-dismiss="modal" onclick="window.location.href = document.referrer;">Chiudi</button>
                        </div>
                    </div>
                </div>`);
