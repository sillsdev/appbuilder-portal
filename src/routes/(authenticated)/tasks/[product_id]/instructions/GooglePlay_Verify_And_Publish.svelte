<h3>Instructions</h3>
<ul>
  <li>
    Download the APK or AAB file by clicking on the entry with type <em>apk</em>
    or
    <em>aab</em>
    in the
    <em>Product Files</em>
    grid view.
  </li>
  <li>
    Test the app
    <sup>1</sup>
    . See
    <a
      href="https://app.scriptoria.io/docs/Installing+Android+Apps+For+Testing.pdf"
      target="_blank"
    >
      Installing Android Apps For Testing
    </a>
    for help.
  </li>
  <li>
    Open the preview of the store listing by clicking on the entry with type <em>play-listing</em>
    in the
    <em>Product Files</em>
    grid view.
  </li>
  <li>
    If you set <strong>BUILD_DOWNLOAD_PLAY_LISTING</strong>
    to have Scriptoria download the Google Play Store Listing information during the buid, it is available
    in the
    <strong>Product Files</strong>
    as
    <strong>play-listing-download</strong>
    . Click on that entry to download it. Open the
    <strong>Publishing &gt; App Store &gt; Google Play Store Listing</strong>
    page and click on the
    <strong>Import From Google Play...</strong>
    button. This will start a wizard where you can select
    <strong>Import from a download of the Google Play listing from Scriptoria</strong>
    .
  </li>
  <li>
    <strong>IMPORTANT!</strong>
    Make sure to remove the
    <strong>BUILD_DOWNLOAD_PLAY_LISTING</strong>
    entry from the Publishing Properties to avoid downloading the listing on every build.
  </li>
  <li>
    Click <strong>Approve</strong>
    when you are satisfied that everything is ready to go and the app will be published.
    <sup>2</sup>
  </li>
</ul>
<h4>Notes</h4>
<ol>
  <li>
    If the &quot;Share app Installer file&quot; feature is enabled, it will be present in the APK
    and not present in the AAB.
  </li>
  <li>
    The first time the app is published, the Organization Admin will need to do extra work to make
    it live. After the first time, it will be available in a shorter amount of time.
  </li>
</ol>
