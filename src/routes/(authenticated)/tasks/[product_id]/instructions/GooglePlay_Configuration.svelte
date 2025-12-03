<h3>Introduction</h3>
<div class="space-y-2">
  <p>
    Scriptoria manages the Google Play Store Listing for the app. This information is stored in the
    project in the
    <strong>Publishing &gt; App Store &gt; Google Play Store Listing</strong>
    page.
  </p>
  <p>
    For existing apps, this information has already been entered into the Google Play Developer
    Console. If you have the information available, you can manually re-enter it. Alternatively,
    Scriptoria can download the Google Play Store Listing information from Google Play for you, and
    you can import it into this page during the first build of the app in Scriptoria.
  </p>
  <p>
    When uploading the project to Scriptoria, normally the App Builder will verify that everything
    is correct. If you are going to download the Google Play Store Listing from Google Play during
    the first build, you will need to uncheck the
    <strong>Verify Google Play Store listing when sending app data</strong>
    checkbox on the
    <strong>Publishing &gt; App Store &gt; Scriptoria</strong>
    page. Please re-check this box after the Play Listing has been imported.
  </p>
</div>
<h3>Instructions</h3>
<ul>
  <li>
    In the <strong>Publishing &gt; App Store &gt; App Publishing</strong>
    configuration page:
    <ul>
      <li>
        Enable Scriptoria by selecting the <strong>We would like to use Scriptoria</strong>
        option.
      </li>
    </ul>
  </li>
  <li>
    In the <strong>Publishing &gt; App Store &gt; Google Play Store Listing</strong>
    configuration page:
    <ul>
      <li>Fill out the Google Play Store Listing information.</li>
      <li>
        For existing apps, Scriptoria can download the Google Play Store Listing from Google Play
        (in the next step).
      </li>
    </ul>
  </li>
  <li>
    In the <strong>Publishing &gt; App Store &gt; Publishing Properties</strong>
    configuration page:
    <ul>
      <li>Fill out any needed publishing properties.</li>
      <li>
        For new apps, set <strong>BUILD_ANDROID_AAB</strong>
        to the value 1.
      </li>
      <li>
        You may need to set <strong>BUILD_KEYSTORE</strong>
        to the name of a keystore. Check with the Organization Administrator if you are unsure.
      </li>
      <li>
        For existing apps, to download the Play Listing from Google Play, set
        <strong>BUILD_DOWNLOAD_PLAY_LISTING</strong>
        to the value 1.
      </li>
      <li>
        See the <a href="https://app.scriptoria.io/docs/Publishing+Properties.pdf" target="_blank">
          Publishing Properties Documentation
        </a>
        for more details.
      </li>
    </ul>
  </li>
  <li>
    In the <strong>Publishing &gt; App Store &gt; Scriptoria</strong>
    configuration page:
    <ul>
      <li>
        Copy and Paste the above <strong>App Project URL</strong>
        into the
        <strong>Enter App Project URL</strong>
        field.
      </li>
      <li>For existing apps, if you have previously</li>
      <li>
        Click <strong>Login...</strong>
        to connect to Scriptoria.
      </li>
      <li>
        Click <strong>Upload</strong>
        and successfully upload the data to the app publishing repository.
      </li>
    </ul>
  </li>
  <li>
    To continue:
    <ul>
      <li>
        If this is a new app that has not been uploaded to Google Play yet, click <strong>
          New App
        </strong>
        .
      </li>
      <li>
        If this is an app that already exists in Google Play, click <strong>Existing App</strong>
        .
      </li>
    </ul>
  </li>
</ul>
