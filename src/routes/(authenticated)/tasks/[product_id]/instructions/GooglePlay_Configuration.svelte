<h3>Introduction</h3>
<div class="space-y-2">
  <p>
    Scriptoria manages the Google Play Store Listing for the app. This information is stored in the
    project in the
    <strong>Publishing &gt; App Store &gt; Google Play Store Listing</strong>
    configuration page.
  </p>
  <p>
    For existing apps, this information has already been entered into the Google Play Developer
    Console. If you have the information available, you can manually re-enter it. Alternatively,
    Scriptoria can download the Google Play Store Listing information from Google Play for you, and
    you can import it into this configuration page during the first build of the app in Scriptoria.
  </p>
  <p>
    When uploading the project to Scriptoria, normally the App Builder will verify that everything
    is correct. If you are going to download the Google Play Store Listing from Google Play during
    the first build, you will need to uncheck the
    <strong>Verify Google Play Store listing when sending app data</strong>
    checkbox on the
    <strong>Publishing &gt; App Store &gt; Scriptoria</strong>
    configuration page. Please re-check this box after the Google Play Store Listing has been imported.
  </p>
</div>
<h3>Options</h3>
<ul>
  <li>
    In the <strong>Publishing &gt; App Store &gt; Google Play Store Listing</strong>
    configuration page:
    <div class="flex flex-col space-y-1 py-1">
      <label class="flex flex-row space-x-1">
        <input type="radio" class="radio radio-accent" name="play-listing" />
        <span>I have filled out the Google Play Store Listing information</span>
      </label>
      <label class="flex flex-row space-x-1">
        <input
          type="radio"
          class="radio radio-accent"
          name="play-listing"
          value="BUILD_DOWNLOAD_PLAY_LISTING"
        />
        <span>
          Have Scriptoria download and use the existing Google Play Store Listing information
        </span>
      </label>
    </div>
  </li>
</ul>
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
