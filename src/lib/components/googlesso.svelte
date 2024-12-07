<script>
	let { onGoogleJwtReceived } = $props(); // for child->parent data passing

	// callback for google sign on
	// ref: https://stackoverflow.com/questions/57954008/call-svelte-components-function-from-global-scope
	window.handleCredentialResponse = (googleUser) => {
		// ref: https://developers.google.com/identity/gsi/web/guides/migration

		var credential = googleUser.credential;
		if (credential) {
			onGoogleJwtReceived(credential);
		}
	};
</script>

<svelte:head>
	<script src="https://accounts.google.com/gsi/client" async defer></script>
	<div
		id="g_id_onload"
		data-client_id="252003591802-1kisuuqkvkcvk103cbj2jvdo46vpnqel.apps.googleusercontent.com"
		data-callback="handleCredentialResponse"
	></div>
</svelte:head>

<div>
	<div class="g_id_signin" data-type="standard"></div>
</div>
