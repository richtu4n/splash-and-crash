
Stripe.setPublishableKey('pk_test_VUq5GazNdBC0SNWYzaIRz9ta');

$(document).ready(function() {
  var $form = $('#payment-form');
  $form.submit(function(event) {
    console.log('submit');
    // Disable the submit button to prevent repeated clicks:
    $form.find('.submit').prop('disabled', true);

    // Request a token from Stripe:
    Stripe.card.createToken($form, stripeResponseHandler);

    // Prevent the form from being submitted:
    return false;
  });
});


function stripeResponseHandler(status, response) {
  // Grab the form:
  console.log('stripe response handler');
  var $form = $('#payment-form');

  if (response.error) { // Problem!
    console.log('error');
    // Show the errors on the form:
    $form.find('.payment-errors').text(response.error.message);
    $form.find('.submit').prop('disabled', false); // Re-enable submission

  } else { // Token was created!
    console.log('success');
    // Get the token ID:
    var token = response.id;

    // Insert the token ID into the form so it gets submitted to the server:
    $form.append($('<input type="hidden" name="stripeToken">').val(token));

    // Submit the form:
    $form.get(0).submit();

    //Success message!
  }
};


function callPost(){
  $('#payment-form').get(0).submit();
}