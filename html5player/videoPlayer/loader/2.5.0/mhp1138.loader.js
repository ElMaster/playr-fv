/*
 * MHP1138 Player v.2.5.0
 */

var __,
MHP1138 = {
	initLoader: function(settings){
		MHP1138.loader.initLoader(settings);
	},

	createPlayer: function(id, settings){
		//store player setting until the utils are ready
		if( this.playerReady ){
			MHP1138.player.createPlayer(id, settings);
		}else{
			MHP1138.players[id] = settings;
		}
	},

	//METHODS that return information
	//return selected player type/name
	playerType: function(id){
		return MHP1138.player.playerType(id);
	},

	//Return if the player is currently playing as a boolean
	isPlaying: function(id){
		return MHP1138.player.isPlaying(id);
	},

	//METHOladytronDS that do something.
	//destroy the player and clean the object to avoir memory leak.
	destroyPlayer: function(id, callback){
		MHP1138.player.destroyPlayer(id, callback);
	},

	//seek to a specific time in seconds, and stay paused if the player is not playing at the moment
	//There a bug on both flash player that prevent this from working correctly at the moment.
	seek: function(id, offset, playAfter){
		if( !__.isBoolean(playAfter) ){ playAfter = true; }
		MHP1138.player.seek(id, offset, playAfter);
	},

	//play the video
	play: function(id){
		MHP1138.player.play(id);
	},

	//pause the video
	pause: function(id) {
		MHP1138.player.pause(id);
	},

	//play the video
	showAutoNextMenu: function(id){
		MHP1138.player.showAutoNextMenu(id);
	},

	//pause the video
	hideAutoNextMenu: function(id) {
		MHP1138.player.hideAutoNextMenu(id);
	},

	isMuted: function(id){
		return MHP1138.player.isMuted(id);
	},

	setMute: function(id, state){
		MHP1138.player.setMute(id, state);
	},

	getVolume: function(id){
		return MHP1138.player.getVolume(id);
	},

	setVolume: function(id, volumeLevel){
		MHP1138.player.setVolume(id, volumeLevel);
	},

	showMenu: function(id){
		MHP1138.player.showMenu(id);
	},

	hideMenu: function(id){
		MHP1138.player.hideMenu(id);
	},

	getCurrentTime: function(id){
		return MHP1138.player.getCurrentTime(id);
	},

	highlightActionTag: function(id, time){
		MHP1138.player.highlightActionTag(id, time);
	},

	clearActionTagHighlight: function(id){
		MHP1138.player.clearActionTagHighlight(id);
	},

	exitFullscreen: function(id){
		MHP1138.player.exitFullscreen(id);
	},

	inspect: function(){
		return MHP1138.player.inspect();
	},
	checkIE: function (){
		var rv = -1; // Return value assumes failure.
		if (navigator.appName == 'Microsoft Internet Explorer')
		{
		var ua = navigator.userAgent;
		var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(ua) != null)
		  rv = parseFloat( RegExp.$1 );
		}
		return rv;
	},
	loader: null,
	player: null,
	detector: null,

	choosenPlayer: {
		playerName: '',
		version: 'stable'
	},

	//hold the name of the skin already loaded and their settings.
	skins: {},

	//hold the skins html code loaded in JSONP
	skinsMarkup: {},

	//used by the html5 player to tell if its master css sheets has been loader
	//by at least one player.
	loadedMasterCSS: false,

	//players are stored here if created before the utils lib or the player
	//handler is ready.
	players: {},

	//is the player handler ready? or do we need to store the call to
	//createPlayer
	playerReady: false,

	loaderVersion: '2.5.0',

	//We only want to create those events once, this var help making sure its
	//only called once by the first player created.
	flashPlayer_eventFunctionCreated: false,

	//ERRORS & MINIFICATION HANDLING
	isOldIE: !+"\v1", // detect IE 8 and less
	isNoFullScreenIE: function(){return((this.checkIE() < 11 && !(this.checkIE() === -1) && !(this.checkIE() === 0 )) )},
	minified: false,
	addFileModeToPath: function(path){
		if( this.minified )
			path = path.substr(0, path.lastIndexOf('.')) + '.min' + path.substr(path.lastIndexOf('.'));
		return path;
	},

	log: function(message){
		this.outputConsoleLog('mhp1138: ' + message, 'log');
	},

	warn: function(message) {
		this.outputConsoleLog('mhp1138: ' + message, 'warn');
	},

	error: function(message){
		this.outputConsoleLog('mhp1138: v.2.5.0 -- o_O --> ' + message, 'error');
	},

	outputConsoleLog: function(message, type){
		if( !this.isOldIE && !this.minified )
			console[type](message/*, Date.now()-timerStart*/);
	},

	//extract the filename from a path.
	//is here because its needed before the utils library is loaded
	//After its loaded, this function is added to underscore as __.pathToFileName
	pathToFileName: function(path){
		return path.replace(/^.*[\\\/]/, '');
	},

	//extract the value of a query string. return null if the querystring is not defined.
	//like previous function, become __.getParameterByName once the utils lib is loaded.
	getParameterByName: function(name){
		var match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);

		//to remove once everysite has switched to passing var via hash
		if( match == null ){
			var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
		}

		return ( match == null ) ? false : decodeURIComponent(match[1].replace(/\+/g, ' '));
	}
};

MHP1138.loader = (function(){
	var loaderSettings = {
		playerUsageOrder: 	 [],
		pathToBuildFolder: 	 '//ss.phncdn.com/html5player/',

		supportTest: {
			'basicHTML5': {
				fileToSupport: ['h264']
			},
			'HTML5Player': {
				fileToSupport: ['h264']
			},
			'4Play': {
				minFlashVersion: "10.2"
			},
			'oldFlash': {
				minFlashVersion: "9.0"
			},
			'HTML5PlayerTablet': {
				fileToSupport: ['h264']
			},
			'HTML5PlayerMobile': {
				fileToSupport: ['h264']
			}

		},
	};

	var playerSettings = {},
		playerVersions,
		bestPlayer;

	function initLoader(settings) {
		if (MHP1138.getParameterByName('debug')) {
			MHP1138.minified = false;
		}
		if (__.isObject(settings.playerDefaultSettings)) {
			playerSettings = settings.playerDefaultSettings;
		}

		loaderSettings = __.deepExtend(loaderSettings, __.omit(settings, 'playerDefaultSettings'));

		detectBestPlayer();
	}

	function iOSversion() {
		if (/iP(hone|od|ad)/.test(navigator.platform)) {
			// supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
			var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
			return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
		}
	}

	function detectBestPlayer() {
		//INIT THE DETECTOR
		MHP1138.detector.init(loaderSettings.deviceType);

		var parsedPlayerUsageOrder = [],
			isEmbed;

		if (__.isUndefined( playerSettings.embeds)) {
			isEmbed = false;
		} else {
			isEmbed = playerSettings.embeds.enabled;
		}

		__.find(loaderSettings.playerUsageOrder, function(playerName) {
			if (playerName.indexOf('_') == -1) {
				parsedPlayerUsageOrder.push({
					playerName: playerName,
					version: 'stable'
				});

			} else {
				var values = playerName.split('_');

				if (__.isArray(values) &&
					values.length == 2 &&
					values[0].length &&
					values[1].length
				) {
					parsedPlayerUsageOrder.push({
						playerName: values[0],
						version: values[1]
					});
				}
			}
		});

		var browser = MHP1138.detector.getBrowser();

		var isOldSafari = browser.name === 'safari' && browser.version <= 7;

		//Test if the current browser has flash installed

		var hasFlash = false;

		try {
		    hasFlash = Boolean(new ActiveXObject('ShockwaveFlash.ShockwaveFlash'));
		} catch(exception) {
		    hasFlash = ('undefined' != typeof navigator.mimeTypes['application/x-shockwave-flash']);
		}

		//test each player type for support in the current browser until it found one that work.
		MHP1138.choosenPlayer = __.find(parsedPlayerUsageOrder, function(player) {
			switch (player.playerName) {
				case '4Play':
					return __.all(loaderSettings.supportTest[player.playerName].fileToSupport, function(format){
							return __.videoFormatIsSupported(format);
						})
						&& hasFlash;
				case 'basicHTML5':
				case 'basicHTML5Phub':
					return __.all(loaderSettings.supportTest['basicHTML5'].fileToSupport, function(format){
						return __.videoFormatIsSupported(format);
					})
					&& !MHP1138.isOldIE
				case 'HTML5Player':
					return __.all(loaderSettings.supportTest[player.playerName].fileToSupport, function(format){
						return __.videoFormatIsSupported(format);
					})
					&& !MHP1138.detector.isTablet()
					&& !MHP1138.detector.isMobile()
					&& !MHP1138.isNoFullScreenIE()
					&& !MHP1138.detector.isPlaystation() //Playstation has no support for skins
					&& !MHP1138.detector.isXbox() //Xbox has no support for skins
					&& !isOldSafari;
                case 'HTML5PlayerTablet':
                    return __.all(loaderSettings.supportTest[player.playerName].fileToSupport, function(format){
                        return __.videoFormatIsSupported(format);
                    })
                    && !MHP1138.detector.isIe() // We do not support
                    && !MHP1138.detector.isMobile()
                    && !MHP1138.detector.isPlaystation() //Playstation has no support for skins
                    && !MHP1138.detector.isXbox() //Xbox has no support for skins
                    && (checkWebKit() >= 537 &&
                    	getChromeVersion() >= 36 ||
                    	MHP1138.detector.isFirefox() &&
                    	!MHP1138.detector.isIos() ||
                    	MHP1138.detector.isFirefox() &&
                    	isEmbed ||
                    	MHP1138.detector.isIos() &&
                    	iOSversion()[0] > 6 &&
                    	isEmbed
                    );
				case 'HTML5PlayerMobile':
					return __.all(loaderSettings.supportTest[player.playerName].fileToSupport, function(format){
						return __.videoFormatIsSupported(format);
					})
					&& !MHP1138.detector.isIe() //IE Mobile do not support touch events
					&& !MHP1138.detector.isIos() //safari has a bug with seeking
					&& !MHP1138.detector.isTablet()
					&& !MHP1138.detector.isPlaystation() //Playstation has no support for skins
					&& !MHP1138.detector.isXbox() //Xbox has no support for skins
					&& (checkWebKit() >= 537 &&
						getChromeVersion() >= 36 &&
						MHP1138.detector.isChrome() ||
						MHP1138.detector.isFirefox()
					);
				case 'oldFlash':
					return swfobject.hasFlashPlayerVersion( loaderSettings.supportTest[player.playerName].minFlashVersion )
					&& !MHP1138.detector.isMobile() && !MHP1138.detector.isTablet();
			}
		});

		//allow to force a player for debugging
		if (MHP1138.getParameterByName('forcePlayer')) {
			var playerToForce = MHP1138.getParameterByName('forcePlayer');

			if (playerToForce.indexOf('_') == -1) {
				MHP1138.choosenPlayer = {
					playerName: playerToForce,
					version: 'stable'
				};
			} else {
				var values = playerToForce.split('_');

				if (__.isArray(values) &&
					values.length == 2 &&
					values[0].length &&
					values[1].length
				) {
					MHP1138.choosenPlayer = {
						playerName: values[0],
						version: values[1]
					};
				}
			}
		}

		//In case no player is found we call the events to display the download flash message.
		//The event dispacher is not loaded yet so we do that manually
		if (__.isUndefined(MHP1138.choosenPlayer)) {
			__.each(MHP1138.players, function(settings, id) {
				//this player events
				if (!__.isUndefined(settings.events)) {
					if (!__.isUndefined(settings.events.downloadsFlashMessage) &&
						__.isFunction(settings.events.downloadsFlashMessage)
					) {
						settings.events.downloadsFlashMessage(id);
				}
				}

				//Events defined for all players
				if (!__.isUndefined(playerSettings.events)) {
					if (!__.isUndefined(playerSettings.events.downloadsFlashMessage) &&
						__.isFunction(playerSettings.events.downloadsFlashMessage)
					) {
						playerSettings.events.downloadsFlashMessage(id);
					}
				}
			});
			return false;
		}
		MHP1138.player.initPlayer(playerSettings, bestPlayer);
	}

	/**
	 * load a script or stylesheet asynchronously
	 * @param  {string}   path     The complete file path.
	 * @param  {string}   type     File type (js or css).
	 * @param  {Function} callback Return [codeStatus, textStatus, filename, type].
	 * @return nothing
	 */
	function scriptLoader(path, type, callback) {
		// load desktop player with grid
		// 'HTML5Player.' string is matching both developers and minified production versions
		if (loaderSettings.grid &&
			MHP1138.choosenPlayer.playerName == 'HTML5Player' &&
			MHP1138.choosenPlayer.version >= '2.1.0' // the first player version with built-in grid
		) {
			path = path.replace('HTML5Player.', 'HTML5Player.grid.');
		}
		// shorcuts to maximise minification of code
		// stuff like console.log or document never get minified, but if you place
		//them in a var inside a closure they do
		var doc = document,
			head = doc.getElementsByTagName('head')[0],
			script;

		if (type == 'js') {
			script = doc.createElement('script');
			script.src = path;
			script.type = "text/javascript";
		} else if (type == 'css') {
			script = doc.createElement("link");
			script.rel = "stylesheet";
			script.type = "text/css";
			script.href = path;
		} else {
			MHP1138.error('Invalid file format passed to scriptLoader function.');
			return false;
		}

		script.async = true;

		// Attach handlers for all browsers
		script.onload = script.onreadystatechange = function(e) {
			if (!script.readyState ||
				/loaded|complete/.test(script.readyState)
			) {
				// Handle memory leak in IE
				script.onload = script.onreadystatechange = null;

				// Remove the script element if its not a css file
				if (script.parentNode && type !== 'css') {
					script.parentNode.removeChild(script);
				}

				// Dereference the script
				script = null;

				// callback
				if (callback) {
					callback(200, "success", MHP1138.pathToFileName(path), type);
				}
			}
		};

		// Circumvent IE6 bugs with base elements by prepending.
		head.insertBefore(script, head.firstChild);
	}

	//the controller
	return {
		initLoader: function(settings) {
			initLoader(settings);
		},
		scriptLoader: function(scriptPath, type, callback) {
			scriptLoader(scriptPath, type, callback);
		},
		pathToBuildFolder: function() {
			return loaderSettings.pathToBuildFolder;
		}
	};
})();

/*
 * MHP1138 Player v.2.5.0
 */

MHP1138.player = (function() {
	var mediaDefinition = {
		defaultQuality: false,
		format: '', // 'mp4', 'flv', 'upsell'
		quality: '', // '720_60'
		videoUrl: '',
	};

	var thumbs = {
		urlPattern: '',
		format: '5x5',
		type: 'normal',
		preload: false,
		progressive: false,
		async: false,
		samplingFrequency: '0',
		thumbWidth: '160',
		thumbHeight: '90'
	};

	var overlayAd = {
		displayDuration: 45,
		displayText: '',
		linkUrl: '',
		showDelay: 5,
	};

	var rollObject = {
		actionTags: '', // ActionTagTitle:Time(:Duration), e.g. 'Title1:60:4,Title2:350,TitleWhatever:450'
		autoPlay: false,
		campaignName: '',
		clickUrl: '',
		imageHeight: 0,
		imageUrl: '',
		imageWidth: 0,
		mediaDefinition: [],
		overlays: [],
		overlayTextAd: overlayAd,
		posterFrameUrl: '',
		profileAdUrl: '',
		// bug->feature ;), set it to any value between 0 and 1 to instantly show 'skip ad' message
		// during the whole ad without delay timer
		skipDelay: 0,
		skipDelayMessage: '', // 'Skip Ad in % seconds'
		skipMessage: '', // 'Skip Ad >>'
		shownOnlyInFullScreen: false,
		thumbs: thumbs,
		timing: 'main', // 'preroll', 'postroll', 'pauseroll'
		title: '',
		trackUrl: '',
		type: 'video', // 'static'
		videoTitle: '',
		videoDuration: 0,
		videoUnavailable: false,
		videoUnavailableMessage: '',
		videoUrl: '',
		watchPageUrl: '',
	};

	var defaultSettings = {
		autoplay: false,
		autoplayAds: true,
		quickSetup: false, //false or string
		siteId: null, //for preroll statistics purpose, ask Aristo for values.
		seekParams: {/*
			flv: 'fs',
			mp4: 'ms'
		*/},
		startOffset: 0,
		productUrl: '',
		referrerUrl: '',
		minHDQuality: 720,
		minUHDQuality: 2160,
		videoPreload: 'none', // 'auto' | 'metadata'
		seekPreview: true,
		maxSeeksInProgress: 2,
		monitorBandwidth: true,

		htmlSettings: {
			skin: 'default',
			notAvailableMessage: 'This video is not available at the moment.',
			skipMessage: 'Skip Ad &gt;&gt;',
			skipDelayMessage: 'You can skip this video in % second(s)',
			adsTrackUrl: 'http://etahub.com/events?app_id=%APPID%&splayer=%PLAYER%&eventName=%ACTION%&ssite=%SITE%&scampaign=%CAMPAIGN%',
		},

		embeds: {
			enabled: false,

			utmRedirect: {
				logo: true,
				relatedBtns: true,
				thumbs: true
			},

			redirect: {
				onFullscreen: false,
				onMenu: false,
				logoUrl: '',
				relatedUrl: '',
				mostViewedUrl: '',
				mftuUrl: '',
				topRatedUrl: ''
			}
		},

		medias: {
			poster: '',
			sources: {},
			videoUrl: '',
			videoTitle: '',
			videoDuration: 0, //old flash only
			thumbs: thumbs,
			actionTags: '',
			videoUnavailable: false,
			videoUnavailableMessage: '',
			defaultQuality: [720,480,240,180],
			qualityUpsell: []
		},

		mainRoll: rollObject,
		//preRoll: rollObject,
		postRoll: rollObject,
		pauseRoll: rollObject,

		menu: {
			url: '',
			related: true,
			topRated: true,
			mostViewed: true,
			mftu: true,
			showOnPause: false,
			showOnPost: false
		},

		features:{
			hdIcon: true,
			embedCode: '',
			watchlater: false,
			favorite: false,
			themeColor: '#f6921e', //hex code only with # at the start
			logo: false,
			shareBar: false, // 'share', 'shareBtn' aliases
			topControlBar: false, // 'title', 'topBar' aliases
			playerSizeToggle: false, // 'cinema' alias
			optionsEnabled: false, // 'options'  alias
			autoplayOption: true, // 'autoplay', 'autoPlay', 'autoplayOption', showAutoplayOption' aliases
			fullscreenEnabled: true, // 'fullscreen' alias
			volumeBar: true,
			tooltips: true,
			seekPreview: true,
			hideControlsTimeout: 2.3,
			//ignorePreferences: false // Ignore user preference set by local storage like autoPlay and qualitySelection.
		},

		//flash fallback settings
		flashSettings: {
			appId: 0,
			allowfullscreen: true,
			wmode: 'opaque',
			quality: 'high',
			allowScriptAccess: 'always',
			bgcolor: '#000',
			paths:{
				oldFlash: {
					SWF: ''
				},
				fourPlay: {
					SWF: '',
					skins: [/*
						{
							skinPNG: 'flashPlayer/4Play/skins/spritesheet_global.png',
							skinJSON: 'flashPlayer/4Play/skins/spritesheet_global.json'
						}
					*/]
				}
			},
			cdnProvider: '',
			htmlPauseRoll: null,
			htmlPostRoll: null,
			postRollUrl: '',
			pauseRollUrl: '',
			extraFlashvars: {
				oldFlash: {},
				fourPlay: {}
			}
		},

		events: {}
	};

	var players = {};
	var win = window; //help reducing file size during minification
	var preventMemoryLeak = false; //extra cleanup of closude and object element on IE7-9 to prevent memory leak.

	var eventsDispatcher = {
		eventType: [
			'onPlay',
			'onPause',
			'onEnd',
			'showPreRoll',
			'showPostRoll',
			'showPauseRoll',
			'hideRoll',
			'onShare',
			'expandPlayer',
			'collapsePlayer',
			'voteUp',
			'voteDown',
			'onQualityChange',
			'onQualityUpsell',
			'onDestroy',
			'onVolumeChange',
			'onAutoplayChange',
			'onSeek',
			'onDurationChange',
			'onTimeChange',
			'onPlaylistCountdown',
			'onFullscreen',
			'onKeyboard', // HTML5 skin only, internal use
			'onWatchLater',
			'onFavorite',
			'onWaiting',
			'onBuffer', // HTML5 skin only, for internal use
			'onVideoReady', // HTML5 skin only, for internal use
			'onReady',
			'onRedirect',
			'autoNextOpen',
			'autoNextClosed',
			'copyUrlVideo',
			'copyUrlVideoTime',
			'copyEmbed',
			'onVrError',
			'lowBandwidth'
		],
		events: {},
		playerId: null, // last player fired an event, needed for keyboard shortcuts
		initDispatcher: function(){
			__.each(this.eventType, function(eventName){
				eventsDispatcher.events[eventName] = [];
			});
		},

		subscribe: function(eventName, playerId, callback) {
			if (this.events[eventName]) {
				this.events[eventName].push({ playerId: playerId, callback: callback });
			}
		},
		unsubscribe: function(eventName, playerId, callback){
			var i = this.events[eventName].length;
			while( i-- ){
				if( this.events[eventName][i].playerId == playerId ){
					this.events[eventName].splice(i, 1);

					if( callback )
						callback(eventName, playerId);
				}
			}
		},
		fireEvent: function(eventName, playerId, optionalParams) {
			var self = this;
			__.each(this.events[eventName], function(eventDetail) {
				if (eventDetail.playerId == playerId) {
					eventDetail.callback(playerId, eventName, optionalParams);
					self.playerId = playerId;
				}
			});
		}
	};

	function initPlayer(settings){
		defaultSettings = __.deepExtend(defaultSettings, settings);

		eventsDispatcher.initDispatcher();

		var destinationFolder = '';
		var version = 'stable/'

		switch (MHP1138.choosenPlayer.playerName) {
			case 'basicHTML5':
				destinationFolder = 'basicHtml5/';
				break;
			case 'basicHTML5Phub':
				destinationFolder = 'basicHtml5Phub/';
				break;
			case 'HTML5Player':
			case 'HTML5PlayerTablet':
			case 'HTML5PlayerMobile':
				destinationFolder = 'html5/';
				break;
			case '4Play':
				destinationFolder = '4play/';
				break;
			case 'oldFlash':
				destinationFolder = 'oldFlash/';
				break;
		}

		if (MHP1138.choosenPlayer.version !== 'stable') {
			version = MHP1138.choosenPlayer.version + "/";
		}

		var playerFilename = MHP1138.loader.pathToBuildFolder()
			+ destinationFolder
			+ version
			+ 'mhp1138.player.'
			+ MHP1138.choosenPlayer.playerName
			+ ((MHP1138.minified) ? '.min' : '')
			+ '.js'

		//load the plugin for the player that was choosed as the best one by the loader.
		MHP1138.loader.scriptLoader(playerFilename, 'js', function() {
			MHP1138.playerReady = true;
			sortPlayerCreatedBeforeInit();
		});

		//cleaning stuff before unload to prevent memory leak on IE7-9
		var browser = MHP1138.detector.getBrowser();
		var preventMemoryLeak = (browser.name == 'ie' && browser.version <= 9);
		if (preventMemoryLeak) {
			if (win.addEventListener) {
				win.addEventListener("beforeunload", onUnload);
			} else {
				win.attachEvent("onunload", onUnload);
			}
		}
	}

	//We need to do extra stuff on IE7-9 to prevent memory leak when unloading the page or destroying a player instance.
	function onUnload() {
		__.each(players, function(player){
			destroyPlayer(player.playerId);
		});

		players = null;

		__.purge(document.body);

		win['mhp1138_playerPlugin_' + MHP1138.choosenPlayer.playerName] = null;

		__.each(MHP1138.player, function(v, key){
			MHP1138.player[key] = null;
		});

		__.each(MHP1138.loader, function(v, key){
			MHP1138.loader[key] = null;
		});

		defaultSettings = null;

		__.each(MHP1138, function(v, key){
			MHP1138[key] = null;
		});

		MHP1138 = null;
	}

	//Sort the player that were saved in the MHP1138 wrapper before this file was loaded in the page and send them to the createPlayer function.
	function sortPlayerCreatedBeforeInit() {
		if( __.size(MHP1138.players) ){
			__.each(MHP1138.players, function(settings, id){
				createPlayer(id, settings);
			});
		}
	}

	function createPlayer(id, settings){
		var mergedSettings = __.deepExtend({}, defaultSettings, settings);

		players[id] = win['mhp1138_playerPlugin_' + MHP1138.choosenPlayer.playerName]();

		// we need to subscribe on events from settings config BEFORE actual player init
		subscribePlayerEventsCallbacks(id, mergedSettings);

		players[id].initPlayer(id, mergedSettings);
	}

	function destroyPlayer(id, callback){
		if( __.isObject(players[id]) ){
			//unsubscribe all event from the event dispatcher.
			__.each(eventsDispatcher.eventType, function(event){
				eventsDispatcher.unsubscribe(event, id);
			});
			if (eventsDispatcher.playerId == id) {
				eventsDispatcher.playerId = null;
			}

			//call the player destroy function to clean swf and such.
			players[id].destroy(function(){
				if( preventMemoryLeak ){
					__.each(players[id], function(v, key){
						players[id][key] = null;
					});
				}

				delete players[id];

				if( callback )
					callback();
			});
		}
	}

	//Subscribe the events callback defined in the players setting to the event handler.
	function subscribePlayerEventsCallbacks(id, settings) {
		__.each(eventsDispatcher.eventType, function(eventName) {
			if (__.isFunction(settings.events[eventName])) {
				eventsDispatcher.subscribe(
					eventName,
					id,
					settings.events[eventName]
				);
			}
		});
	}

	//the controller
	return {
		initPlayer: initPlayer,
		createPlayer: createPlayer,
		eventsDispatcher: eventsDispatcher,
		playerType: MHP1138.choosenPlayer.playerName,

		fireEvent: function(eventName, id, optionalParams) {
			eventsDispatcher.fireEvent(eventName, id, optionalParams);
		},

		subscribeToEvent: function(eventName, id, callback) {
			eventsDispatcher.subscribe(eventName, id, callback);
		},

		unsubscribeToEvent: function(eventName, id, callback) {
			eventsDispatcher.unsubscribe(eventName, id, callback);
		},

		getConfigsObject: function(id) {
			return players[id].createConfigJson();
		},

		sendFlashEventToPlayer: function(id, functionArguments) {
			players[id].catchAndFilterEvent(functionArguments);
		},

		destroyPlayer: function(id, callback) {
			destroyPlayer(id, callback);
		},

		seek: function(id, offset, playAfter) {
			players[id].seek(offset, playAfter);
		},

		isPlaying: function(id) {
			return players[id].isPlaying();
		},

		//play the video
		play: function(id) {
			players[id].play();
		},

		//play the video
		isMuted: function(id){
			return players[id].isMuted();
		},

		//pause the video
		pause: function(id) {
			players[id].pause();
		},

		isMuted: function(id){
			return players[id].isMuted();
		},

		setMute: function(id, state) {
			players[id].setMute(state);
		},

		getVolume: function(id){
			return players[id].getVolume();
		},

		setVolume: function(id, volumeLevel){
			players[id].setVolume(volumeLevel);
		},

		showMenu: function(id){
			players[id].showMenu();
		},

		hideMenu: function(id){
			players[id].hideMenu();
		},

		getCurrentTime: function(id){
			return players[id].getCurrentTime(id);
		},

		highlightActionTag: function(id, time){
			players[id].highlightActionTag(time);
		},

		clearActionTagHighlight: function(id){
			players[id].clearActionTagHighlight();
		},

		exitFullscreen: function(id){
			players[id].exitFullscreen();
		},

		setPoster: function(id, poster) {
			players[id].setPoster(poster);
		},

		setActionTags: function(id, actionTags) {
			players[id].setActionTags(actionTags);
		},

		setQuality: function(id, quality) {
			players[id].setQuality(quality);
		},

		setThumbs: function(id, thumbs) {
			players[id].setThumbs(thumbs);
		},

		enableMenu: function(id) {
			players[id].enableMenu();
		},

		disableMenu: function(id) {
			players[id].disableMenu();
		},

		enableTopBar: function(id) {
			players[id].enableTopBar();
		},

		disableTopBar: function(id) {
			players[id].disableTopBar();
		},

		enableLogo: function(id, force) {
			players[id].enableLogo(force);
		},

		disableLogo: function(id) {
			players[id].disableLogo();
		},

		enableSizeToggle: function(id, force) {
			players[id].enableSizeToggle(force);
		},

		disableSizeToggle: function(id) {
			players[id].disableSizeToggle();
		},

		enableOptions: function(id, force) {
			players[id].enableOptions(force);
		},

		disableOptions: function(id) {
			players[id].disableOptions();
		},

		enableFavorites: function(id, force) {
			players[id].enableFavorites(force);
		},

		disableFavorites: function(id) {
			players[id].disableFavorites();
		},

		enableWatchLater: function(id, force) {
			players[id].enableWatchLater(force)
		},

		disableWatchLater: function(id) {
			players[id].disableWatchLater();
		},

		enableShareBar: function(id) {
			players[id].enableShareBar();
		},

		disableShareBar: function(id) {
			players[id].disableShareBar();
		},
		showAutoNextMenu: function(id){
			players[id].showAutoNextMenu();
		},
		hideAutoNextMenu: function(id){
			players[id].hideAutoNextMenu();
		},
		inspect: function(){
			var debug = {};
			__.each(players, function(player, key){
				debug[key] = {
					player: player.settings,
					flashSettings: ( MHP1138.choosenPlayer.playerName == 'oldFlash' || MHP1138.choosenPlayer.playerName == '4Play' ) ? MHP1138.player.getConfigsObject(key) : false
				};
			})
			return debug;
		}
	};

})();

/*
 * MHP1138 Player v.2.5.0
 */

//NOTE HERE THE FUNCTION YOU USE, SO A STRIPED DOWN VERSION OF UNDERSCORE.JS CAN BE MADE BY COMMENTING UNUSED STUFF
// -jF
//	_.extend
//		_.isObject
//	_.isObject
//	_.isFunction
//	_.isString
//	_.omit
//		_.negate
//		_.map
//		_.contains = _.include
//		_.pick
//	_.each = _.forEach
//		_.keys
//	_.find = _.detect
//		_.some = _.any
//		_.iteratee
//	_.all = _.every
//		_.iteratee
//		_.keys
//	_.sortBy
//	_.size
//		_.keys
//	_.template
//		_.defaults
//	_.invert
//	_.mixin
//		_.each
//		_.prototype
//		_.functions
//	_.isUndefined
//
// BEFORE COMMENTING STUFF MAKE SURE ANOTHER UNCOMMENTED FUNCTION IS NOT USING THEM

// Underscore.js 1.8.2
// http://underscorejs.org
// (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Underscore may be freely distributed under the MIT license.

(function() {

	// Baseline setup
	// --------------

	// Establish the root object, `window` in the browser, or `exports` on the server.
	var root = this;

	// Save the previous value of the `_` variable.
	var previousUnderscore = root._;

	// Save bytes in the minified (but not gzipped) version:
	var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	// Create quick reference variables for speed access to core prototypes.
	var
		push             = ArrayProto.push,
		slice            = ArrayProto.slice,
		concat           = ArrayProto.concat,
		toString         = ObjProto.toString,
		hasOwnProperty   = ObjProto.hasOwnProperty;

	// All **ECMAScript 5** native function implementations that we hope to use
	// are declared here.
	var
		nativeIsArray      = Array.isArray,
		nativeKeys         = Object.keys,
		nativeBind         = FuncProto.bind,
		nativeCreate       = Object.create;

	// Naked function reference for surrogate-prototype-swapping.
	var Ctor = function(){};

	// Create a safe reference to the Underscore object for use below.
	var _ = function(obj) {
		if (obj instanceof _) return obj;
		if (!(this instanceof _)) return new _(obj);
		this._wrapped = obj;
	};

	// Export the Underscore object for **Node.js**, with
	// backwards-compatibility for the old `require()` API. If we're in
	// the browser, add `_` as a global object.
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = _;
		}
		exports._ = _;
	} else {
		root._ = _;
	}

	// Current version.
	_.VERSION = '1.8.2';

	// Internal function that returns an efficient (for current engines) version
	// of the passed-in callback, to be repeatedly applied in other Underscore
	// functions.
	var optimizeCb = function(func, context, argCount) {
		if (context === void 0) return func;
		switch (argCount == null ? 3 : argCount) {
			case 1: return function(value) {
				return func.call(context, value);
			};
			case 2: return function(value, other) {
				return func.call(context, value, other);
			};
			case 3: return function(value, index, collection) {
				return func.call(context, value, index, collection);
			};
			case 4: return function(accumulator, value, index, collection) {
				return func.call(context, accumulator, value, index, collection);
			};
		}
		return function() {
			return func.apply(context, arguments);
		};
	};

	// A mostly-internal function to generate callbacks that can be applied
	// to each element in a collection, returning the desired result — either
	// identity, an arbitrary callback, a property matcher, or a property accessor.
	var cb = function(value, context, argCount) {
		if (value == null) return _.identity;
		if (_.isFunction(value)) return optimizeCb(value, context, argCount);
		if (_.isObject(value)) return _.matcher(value);
		return _.property(value);
	};
	_.iteratee = function(value, context) {
		return cb(value, context, Infinity);
	};

	// An internal function for creating assigner functions.
	var createAssigner = function(keysFunc, undefinedOnly) {
		return function(obj) {
			var length = arguments.length;
			if (length < 2 || obj == null) return obj;
			for (var index = 1; index < length; index++) {
				var source = arguments[index],
						keys = keysFunc(source),
						l = keys.length;
				for (var i = 0; i < l; i++) {
					var key = keys[i];
					if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
				}
			}
			return obj;
		};
	};

	// An internal function for creating a new object that inherits from another.
	var baseCreate = function(prototype) {
		if (!_.isObject(prototype)) return {};
		if (nativeCreate) return nativeCreate(prototype);
		Ctor.prototype = prototype;
		var result = new Ctor;
		Ctor.prototype = null;
		return result;
	};

	// Helper for collection methods to determine whether a collection
	// should be iterated as an array or as an object
	// Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	var isArrayLike = function(collection) {
		var length = collection && collection.length;
		return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	};

	// Collection Functions
	// --------------------

	// The cornerstone, an `each` implementation, aka `forEach`.
	// Handles raw objects in addition to array-likes. Treats all
	// sparse array-likes as if they were dense.
	_.each = _.forEach = function(obj, iteratee, context) {
		iteratee = optimizeCb(iteratee, context);
		var i, length;
		if (isArrayLike(obj)) {
			for (i = 0, length = obj.length; i < length; i++) {
				iteratee(obj[i], i, obj);
			}
		} else {
			var keys = _.keys(obj);
			for (i = 0, length = keys.length; i < length; i++) {
				iteratee(obj[keys[i]], keys[i], obj);
			}
		}
		return obj;
	};

	// Return the results of applying the iteratee to each element.
	_.map = _.collect = function(obj, iteratee, context) {
		iteratee = cb(iteratee, context);
		var keys = !isArrayLike(obj) && _.keys(obj),
				length = (keys || obj).length,
				results = Array(length);
		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index;
			results[index] = iteratee(obj[currentKey], currentKey, obj);
		}
		return results;
	};

/*
	// Create a reducing function iterating left or right.
	function createReduce(dir) {
		// Optimized iterator function as using arguments.length
		// in the main function will deoptimize the, see #1991.
		function iterator(obj, iteratee, memo, keys, index, length) {
			for (; index >= 0 && index < length; index += dir) {
				var currentKey = keys ? keys[index] : index;
				memo = iteratee(memo, obj[currentKey], currentKey, obj);
			}
			return memo;
		}

		return function(obj, iteratee, memo, context) {
			iteratee = optimizeCb(iteratee, context, 4);
			var keys = !isArrayLike(obj) && _.keys(obj),
					length = (keys || obj).length,
					index = dir > 0 ? 0 : length - 1;
			// Determine the initial value if none is provided.
			if (arguments.length < 3) {
				memo = obj[keys ? keys[index] : index];
				index += dir;
			}
			return iterator(obj, iteratee, memo, keys, index, length);
		};
	}

	// **Reduce** builds up a single result from a list of values, aka `inject`,
	// or `foldl`.
	_.reduce = _.foldl = _.inject = createReduce(1);

	// The right-associative version of reduce, also known as `foldr`.
	_.reduceRight = _.foldr = createReduce(-1);
*/

	// Return the first value which passes a truth test. Aliased as `detect`.
	_.find = _.detect = function(obj, predicate, context) {
		var key;
		if (isArrayLike(obj)) {
			key = _.findIndex(obj, predicate, context);
		} else {
			key = _.findKey(obj, predicate, context);
		}
		if (key !== void 0 && key !== -1) return obj[key];
	};

	// Return all the elements that pass a truth test.
	// Aliased as `select`.
	_.filter = _.select = function(obj, predicate, context) {
		var results = [];
		predicate = cb(predicate, context);
		_.each(obj, function(value, index, list) {
			if (predicate(value, index, list)) results.push(value);
		});
		return results;
	};

	// Return all the elements for which a truth test fails.
	_.reject = function(obj, predicate, context) {
		return _.filter(obj, _.negate(cb(predicate)), context);
	};

	// Determine whether all of the elements match a truth test.
	// Aliased as `all`.
	_.every = _.all = function(obj, predicate, context) {
		predicate = cb(predicate, context);
		var keys = !isArrayLike(obj) && _.keys(obj),
				length = (keys || obj).length;
		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index;
			if (!predicate(obj[currentKey], currentKey, obj)) return false;
		}
		return true;
	};

	// Determine if at least one element in the object matches a truth test.
	// Aliased as `any`.
	_.some = _.any = function(obj, predicate, context) {
		predicate = cb(predicate, context);
		var keys = !isArrayLike(obj) && _.keys(obj),
				length = (keys || obj).length;
		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index;
			if (predicate(obj[currentKey], currentKey, obj)) return true;
		}
		return false;
	};

	// Determine if the array or object contains a given value (using `===`).
	// Aliased as `includes` and `include`.
	_.contains = _.includes = _.include = function(obj, target, fromIndex) {
		if (!isArrayLike(obj)) obj = _.values(obj);
		return _.indexOf(obj, target, typeof fromIndex == 'number' && fromIndex) >= 0;
	};
/*
	// Invoke a method (with arguments) on every item in a collection.
	_.invoke = function(obj, method) {
		var args = slice.call(arguments, 2);
		var isFunc = _.isFunction(method);
		return _.map(obj, function(value) {
			var func = isFunc ? method : value[method];
			return func == null ? func : func.apply(value, args);
		});
	};
*/
	// Convenience version of a common use case of `map`: fetching a property.
	_.pluck = function(obj, key) {
		return _.map(obj, _.property(key));
	};
/*
	// Convenience version of a common use case of `filter`: selecting only objects
	// containing specific `key:value` pairs.
	_.where = function(obj, attrs) {
		return _.filter(obj, _.matcher(attrs));
	};

	// Convenience version of a common use case of `find`: getting the first object
	// containing specific `key:value` pairs.
	_.findWhere = function(obj, attrs) {
		return _.find(obj, _.matcher(attrs));
	};
*/
	// Return the maximum element (or element-based computation).
	_.max = function(obj, iteratee, context) {
		var result = -Infinity, lastComputed = -Infinity,
				value, computed;
		if (iteratee == null && obj != null) {
			obj = isArrayLike(obj) ? obj : _.values(obj);
			for (var i = 0, length = obj.length; i < length; i++) {
				value = obj[i];
				if (value > result) {
					result = value;
				}
			}
		} else {
			iteratee = cb(iteratee, context);
			_.each(obj, function(value, index, list) {
				computed = iteratee(value, index, list);
				if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
					result = value;
					lastComputed = computed;
				}
			});
		}
		return result;
	};
/*
	// Return the minimum element (or element-based computation).
	_.min = function(obj, iteratee, context) {
		var result = Infinity, lastComputed = Infinity,
				value, computed;
		if (iteratee == null && obj != null) {
			obj = isArrayLike(obj) ? obj : _.values(obj);
			for (var i = 0, length = obj.length; i < length; i++) {
				value = obj[i];
				if (value < result) {
					result = value;
				}
			}
		} else {
			iteratee = cb(iteratee, context);
			_.each(obj, function(value, index, list) {
				computed = iteratee(value, index, list);
				if (computed < lastComputed || computed === Infinity && result === Infinity) {
					result = value;
					lastComputed = computed;
				}
			});
		}
		return result;
	};

	// Shuffle a collection, using the modern version of the
	// [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	_.shuffle = function(obj) {
		var set = isArrayLike(obj) ? obj : _.values(obj);
		var length = set.length;
		var shuffled = Array(length);
		for (var index = 0, rand; index < length; index++) {
			rand = _.random(0, index);
			if (rand !== index) shuffled[index] = shuffled[rand];
			shuffled[rand] = set[index];
		}
		return shuffled;
	};

	// Sample **n** random values from a collection.
	// If **n** is not specified, returns a single random element.
	// The internal `guard` argument allows it to work with `map`.
	_.sample = function(obj, n, guard) {
		if (n == null || guard) {
			if (!isArrayLike(obj)) obj = _.values(obj);
			return obj[_.random(obj.length - 1)];
		}
		return _.shuffle(obj).slice(0, Math.max(0, n));
	};
*/
	// Sort the object's values by a criterion produced by an iteratee.
	_.sortBy = function(obj, iteratee, context) {
		iteratee = cb(iteratee, context);
		return _.pluck(_.map(obj, function(value, index, list) {
			return {
				value: value,
				index: index,
				criteria: iteratee(value, index, list)
			};
		}).sort(function(left, right) {
			var a = left.criteria;
			var b = right.criteria;
			if (a !== b) {
				if (a > b || a === void 0) return 1;
				if (a < b || b === void 0) return -1;
			}
			return left.index - right.index;
		}), 'value');
	};
/*
	// An internal function used for aggregate "group by" operations.
	var group = function(behavior) {
		return function(obj, iteratee, context) {
			var result = {};
			iteratee = cb(iteratee, context);
			_.each(obj, function(value, index) {
				var key = iteratee(value, index, obj);
				behavior(result, value, key);
			});
			return result;
		};
	};

	// Groups the object's values by a criterion. Pass either a string attribute
	// to group by, or a function that returns the criterion.
	_.groupBy = group(function(result, value, key) {
		if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	});

	// Indexes the object's values by a criterion, similar to `groupBy`, but for
	// when you know that your index values will be unique.
	_.indexBy = group(function(result, value, key) {
		result[key] = value;
	});

	// Counts instances of an object that group by a certain criterion. Pass
	// either a string attribute to count by, or a function that returns the
	// criterion.
	_.countBy = group(function(result, value, key) {
		if (_.has(result, key)) result[key]++; else result[key] = 1;
	});

	// Safely create a real, live array from anything iterable.
	_.toArray = function(obj) {
		if (!obj) return [];
		if (_.isArray(obj)) return slice.call(obj);
		if (isArrayLike(obj)) return _.map(obj, _.identity);
		return _.values(obj);
	};
*/
	// Return the number of elements in an object.
	_.size = function(obj) {
		if (obj == null) return 0;
		return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	};
/*
	// Split a collection into two arrays: one whose elements all satisfy the given
	// predicate, and one whose elements all do not satisfy the predicate.
	_.partition = function(obj, predicate, context) {
		predicate = cb(predicate, context);
		var pass = [], fail = [];
		_.each(obj, function(value, key, obj) {
			(predicate(value, key, obj) ? pass : fail).push(value);
		});
		return [pass, fail];
	};

	// Array Functions
	// ---------------

	// Get the first element of an array. Passing **n** will return the first N
	// values in the array. Aliased as `head` and `take`. The **guard** check
	// allows it to work with `_.map`.
	_.first = _.head = _.take = function(array, n, guard) {
		if (array == null) return void 0;
		if (n == null || guard) return array[0];
		return _.initial(array, array.length - n);
	};

	// Returns everything but the last entry of the array. Especially useful on
	// the arguments object. Passing **n** will return all the values in
	// the array, excluding the last N.
	_.initial = function(array, n, guard) {
		return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	};

	// Get the last element of an array. Passing **n** will return the last N
	// values in the array.
	_.last = function(array, n, guard) {
		if (array == null) return void 0;
		if (n == null || guard) return array[array.length - 1];
		return _.rest(array, Math.max(0, array.length - n));
	};

	// Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	// Especially useful on the arguments object. Passing an **n** will return
	// the rest N values in the array.
	_.rest = _.tail = _.drop = function(array, n, guard) {
		return slice.call(array, n == null || guard ? 1 : n);
	};

	// Trim out all falsy values from an array.
	_.compact = function(array) {
		return _.filter(array, _.identity);
	};
*/
	// Internal implementation of a recursive `flatten` function.
	var flatten = function(input, shallow, strict, startIndex) {
		var output = [], idx = 0;
		for (var i = startIndex || 0, length = input && input.length; i < length; i++) {
			var value = input[i];
			if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
				//flatten current level of array or arguments object
				if (!shallow) value = flatten(value, shallow, strict);
				var j = 0, len = value.length;
				output.length += len;
				while (j < len) {
					output[idx++] = value[j++];
				}
			} else if (!strict) {
				output[idx++] = value;
			}
		}
		return output;
	};

	// Flatten out an array, either recursively (by default), or just one level.
	_.flatten = function(array, shallow) {
		return flatten(array, shallow, false);
	};
/*
	// Return a version of the array that does not contain the specified value(s).
	_.without = function(array) {
		return _.difference(array, slice.call(arguments, 1));
	};

	// Produce a duplicate-free version of the array. If the array has already
	// been sorted, you have the option of using a faster algorithm.
	// Aliased as `unique`.
	_.uniq = _.unique = function(array, isSorted, iteratee, context) {
		if (array == null) return [];
		if (!_.isBoolean(isSorted)) {
			context = iteratee;
			iteratee = isSorted;
			isSorted = false;
		}
		if (iteratee != null) iteratee = cb(iteratee, context);
		var result = [];
		var seen = [];
		for (var i = 0, length = array.length; i < length; i++) {
			var value = array[i],
					computed = iteratee ? iteratee(value, i, array) : value;
			if (isSorted) {
				if (!i || seen !== computed) result.push(value);
				seen = computed;
			} else if (iteratee) {
				if (!_.contains(seen, computed)) {
					seen.push(computed);
					result.push(value);
				}
			} else if (!_.contains(result, value)) {
				result.push(value);
			}
		}
		return result;
	};

	// Produce an array that contains the union: each distinct element from all of
	// the passed-in arrays.
	_.union = function() {
		return _.uniq(flatten(arguments, true, true));
	};

	// Produce an array that contains every item shared between all the
	// passed-in arrays.
	_.intersection = function(array) {
		if (array == null) return [];
		var result = [];
		var argsLength = arguments.length;
		for (var i = 0, length = array.length; i < length; i++) {
			var item = array[i];
			if (_.contains(result, item)) continue;
			for (var j = 1; j < argsLength; j++) {
				if (!_.contains(arguments[j], item)) break;
			}
			if (j === argsLength) result.push(item);
		}
		return result;
	};

	// Take the difference between one array and a number of other arrays.
	// Only the elements present in just the first array will remain.
	_.difference = function(array) {
		var rest = flatten(arguments, true, true, 1);
		return _.filter(array, function(value){
			return !_.contains(rest, value);
		});
	};

	// Zip together multiple lists into a single array -- elements that share
	// an index go together.
	_.zip = function() {
		return _.unzip(arguments);
	};

	// Complement of _.zip. Unzip accepts an array of arrays and groups
	// each array's elements on shared indices
	_.unzip = function(array) {
		var length = array && _.max(array, 'length').length || 0;
		var result = Array(length);

		for (var index = 0; index < length; index++) {
			result[index] = _.pluck(array, index);
		}
		return result;
	};
*/
	// Converts lists into objects. Pass either a single array of `[key, value]`
	// pairs, or two parallel arrays of the same length -- one of keys, and one of
	// the corresponding values.
	_.object = function(list, values) {
		var result = {};
		for (var i = 0, length = list && list.length; i < length; i++) {
			if (values) {
				result[list[i]] = values[i];
			} else {
				result[list[i][0]] = list[i][1];
			}
		}
		return result;
	};

	// Return the position of the first occurrence of an item in an array,
	// or -1 if the item is not included in the array.
	// If the array is large and already in sort order, pass `true`
	// for **isSorted** to use binary search.
	_.indexOf = function(array, item, isSorted) {
		var i = 0, length = array && array.length;
		if (typeof isSorted == 'number') {
			i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
		} else if (isSorted && length) {
			i = _.sortedIndex(array, item);
			return array[i] === item ? i : -1;
		}
		if (item !== item) {
			return _.findIndex(slice.call(array, i), _.isNaN);
		}
		for (; i < length; i++) if (array[i] === item) return i;
		return -1;
	};
/*
	_.lastIndexOf = function(array, item, from) {
		var idx = array ? array.length : 0;
		if (typeof from == 'number') {
			idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
		}
		if (item !== item) {
			return _.findLastIndex(slice.call(array, 0, idx), _.isNaN);
		}
		while (--idx >= 0) if (array[idx] === item) return idx;
		return -1;
	};
*/
	// Generator function to create the findIndex and findLastIndex functions
	function createIndexFinder(dir) {
		return function(array, predicate, context) {
			predicate = cb(predicate, context);
			var length = array != null && array.length;
			var index = dir > 0 ? 0 : length - 1;
			for (; index >= 0 && index < length; index += dir) {
				if (predicate(array[index], index, array)) return index;
			}
			return -1;
		};
	}

	// Returns the first index on an array-like that passes a predicate test
	_.findIndex = createIndexFinder(1);

	_.findLastIndex = createIndexFinder(-1);
/*
	// Use a comparator function to figure out the smallest index at which
	// an object should be inserted so as to maintain order. Uses binary search.
	_.sortedIndex = function(array, obj, iteratee, context) {
		iteratee = cb(iteratee, context, 1);
		var value = iteratee(obj);
		var low = 0, high = array.length;
		while (low < high) {
			var mid = Math.floor((low + high) / 2);
			if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
		}
		return low;
	};

	// Generate an integer Array containing an arithmetic progression. A port of
	// the native Python `range()` function. See
	// [the Python documentation](http://docs.python.org/library/functions.html#range).
	_.range = function(start, stop, step) {
		if (arguments.length <= 1) {
			stop = start || 0;
			start = 0;
		}
		step = step || 1;

		var length = Math.max(Math.ceil((stop - start) / step), 0);
		var range = Array(length);

		for (var idx = 0; idx < length; idx++, start += step) {
			range[idx] = start;
		}

		return range;
	};
*/
	// Function (ahem) Functions
	// ------------------

	// Determines whether to execute a function as a constructor
	// or a normal function with the provided arguments
	var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
		if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
		var self = baseCreate(sourceFunc.prototype);
		var result = sourceFunc.apply(self, args);
		if (_.isObject(result)) return result;
		return self;
	};
/*
	// Create a function bound to a given object (assigning `this`, and arguments,
	// optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	// available.
	_.bind = function(func, context) {
		if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
		if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
		var args = slice.call(arguments, 2);
		var bound = function() {
			return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
		};
		return bound;
	};

	// Partially apply a function by creating a version that has had some of its
	// arguments pre-filled, without changing its dynamic `this` context. _ acts
	// as a placeholder, allowing any combination of arguments to be pre-filled.
	_.partial = function(func) {
		var boundArgs = slice.call(arguments, 1);
		var bound = function() {
			var position = 0, length = boundArgs.length;
			var args = Array(length);
			for (var i = 0; i < length; i++) {
				args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
			}
			while (position < arguments.length) args.push(arguments[position++]);
			return executeBound(func, bound, this, this, args);
		};
		return bound;
	};

	// Bind a number of an object's methods to that object. Remaining arguments
	// are the method names to be bound. Useful for ensuring that all callbacks
	// defined on an object belong to it.
	_.bindAll = function(obj) {
		var i, length = arguments.length, key;
		if (length <= 1) throw new Error('bindAll must be passed function names');
		for (i = 1; i < length; i++) {
			key = arguments[i];
			obj[key] = _.bind(obj[key], obj);
		}
		return obj;
	};

	// Memoize an expensive function by storing its results.
	_.memoize = function(func, hasher) {
		var memoize = function(key) {
			var cache = memoize.cache;
			var address = '' + (hasher ? hasher.apply(this, arguments) : key);
			if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
			return cache[address];
		};
		memoize.cache = {};
		return memoize;
	};

	// Delays a function for the given number of milliseconds, and then calls
	// it with the arguments supplied.
	_.delay = function(func, wait) {
		var args = slice.call(arguments, 2);
		return setTimeout(function(){
			return func.apply(null, args);
		}, wait);
	};

	// Defers a function, scheduling it to run after the current call stack has
	// cleared.
	_.defer = _.partial(_.delay, _, 1);

	// Returns a function, that, when invoked, will only be triggered at most once
	// during a given window of time. Normally, the throttled function will run
	// as much as it can, without ever going more than once per `wait` duration;
	// but if you'd like to disable the execution on the leading edge, pass
	// `{leading: false}`. To disable execution on the trailing edge, ditto.
	_.throttle = function(func, wait, options) {
		var context, args, result;
		var timeout = null;
		var previous = 0;
		if (!options) options = {};
		var later = function() {
			previous = options.leading === false ? 0 : _.now();
			timeout = null;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		};
		return function() {
			var now = _.now();
			if (!previous && options.leading === false) previous = now;
			var remaining = wait - (now - previous);
			context = this;
			args = arguments;
			if (remaining <= 0 || remaining > wait) {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}
				previous = now;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			}
			return result;
		};
	};

	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the function on the
	// leading edge, instead of the trailing.
	_.debounce = function(func, wait, immediate) {
		var timeout, args, context, timestamp, result;

		var later = function() {
			var last = _.now() - timestamp;

			if (last < wait && last >= 0) {
				timeout = setTimeout(later, wait - last);
			} else {
				timeout = null;
				if (!immediate) {
					result = func.apply(context, args);
					if (!timeout) context = args = null;
				}
			}
		};

		return function() {
			context = this;
			args = arguments;
			timestamp = _.now();
			var callNow = immediate && !timeout;
			if (!timeout) timeout = setTimeout(later, wait);
			if (callNow) {
				result = func.apply(context, args);
				context = args = null;
			}

			return result;
		};
	};

	// Returns the first function passed as an argument to the second,
	// allowing you to adjust arguments, run code before and after, and
	// conditionally execute the original function.
	_.wrap = function(func, wrapper) {
		return _.partial(wrapper, func);
	};
*/
	// Returns a negated version of the passed-in predicate.
	_.negate = function(predicate) {
		return function() {
			return !predicate.apply(this, arguments);
		};
	};
/*
	// Returns a function that is the composition of a list of functions, each
	// consuming the return value of the function that follows.
	_.compose = function() {
		var args = arguments;
		var start = args.length - 1;
		return function() {
			var i = start;
			var result = args[start].apply(this, arguments);
			while (i--) result = args[i].call(this, result);
			return result;
		};
	};

	// Returns a function that will only be executed on and after the Nth call.
	_.after = function(times, func) {
		return function() {
			if (--times < 1) {
				return func.apply(this, arguments);
			}
		};
	};

	// Returns a function that will only be executed up to (but not including) the Nth call.
	_.before = function(times, func) {
		var memo;
		return function() {
			if (--times > 0) {
				memo = func.apply(this, arguments);
			}
			if (times <= 1) func = null;
			return memo;
		};
	};

	// Returns a function that will be executed at most one time, no matter how
	// often you call it. Useful for lazy initialization.
	_.once = _.partial(_.before, 2);
*/
	// Object Functions
	// ----------------

	// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
											'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	function collectNonEnumProps(obj, keys) {
		var nonEnumIdx = nonEnumerableProps.length;
		var constructor = obj.constructor;
		var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

		// Constructor is a special case.
		var prop = 'constructor';
		if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

		while (nonEnumIdx--) {
			prop = nonEnumerableProps[nonEnumIdx];
			if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
				keys.push(prop);
			}
		}
	}

	// Retrieve the names of an object's own properties.
	// Delegates to **ECMAScript 5**'s native `Object.keys`
	_.keys = function(obj) {
		if (!_.isObject(obj)) return [];
		if (nativeKeys) return nativeKeys(obj);
		var keys = [];
		for (var key in obj) if (_.has(obj, key)) keys.push(key);
		// Ahem, IE < 9.
		if (hasEnumBug) collectNonEnumProps(obj, keys);
		return keys;
	};

	// Retrieve all the property names of an object.
	_.allKeys = function(obj) {
		if (!_.isObject(obj)) return [];
		var keys = [];
		for (var key in obj) keys.push(key);
		// Ahem, IE < 9.
		if (hasEnumBug) collectNonEnumProps(obj, keys);
		return keys;
	};
/*
	// Retrieve the values of an object's properties.
	_.values = function(obj) {
		var keys = _.keys(obj);
		var length = keys.length;
		var values = Array(length);
		for (var i = 0; i < length; i++) {
			values[i] = obj[keys[i]];
		}
		return values;
	};

	// Returns the results of applying the iteratee to each element of the object
	// In contrast to _.map it returns an object
	_.mapObject = function(obj, iteratee, context) {
		iteratee = cb(iteratee, context);
		var keys =  _.keys(obj),
					length = keys.length,
					results = {},
					currentKey;
			for (var index = 0; index < length; index++) {
				currentKey = keys[index];
				results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
			}
			return results;
	};

	// Convert an object into a list of `[key, value]` pairs.
	_.pairs = function(obj) {
		var keys = _.keys(obj);
		var length = keys.length;
		var pairs = Array(length);
		for (var i = 0; i < length; i++) {
			pairs[i] = [keys[i], obj[keys[i]]];
		}
		return pairs;
	};
*/
	// Invert the keys and values of an object. The values must be serializable.
	_.invert = function(obj) {
		var result = {};
		var keys = _.keys(obj);
		for (var i = 0, length = keys.length; i < length; i++) {
			result[obj[keys[i]]] = keys[i];
		}
		return result;
	};

	// Return a sorted list of the function names available on the object.
	// Aliased as `methods`
	_.functions = _.methods = function(obj) {
		var names = [];
		for (var key in obj) {
			if (_.isFunction(obj[key])) names.push(key);
		}
		return names.sort();
	};

	// Extend a given object with all the properties in passed-in object(s).
	_.extend = createAssigner(_.allKeys);

	// Assigns a given object with all the own properties in the passed-in object(s)
	// (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	_.extendOwn = _.assign = createAssigner(_.keys);

	// Returns the first key on an object that passes a predicate test
	_.findKey = function(obj, predicate, context) {
		predicate = cb(predicate, context);
		var keys = _.keys(obj), key;
		for (var i = 0, length = keys.length; i < length; i++) {
			key = keys[i];
			if (predicate(obj[key], key, obj)) return key;
		}
	};

	// Return a copy of the object only containing the whitelisted properties.
	_.pick = function(object, oiteratee, context) {
		var result = {}, obj = object, iteratee, keys;
		if (obj == null) return result;
		if (_.isFunction(oiteratee)) {
			keys = _.allKeys(obj);
			iteratee = optimizeCb(oiteratee, context);
		} else {
			keys = flatten(arguments, false, false, 1);
			iteratee = function(value, key, obj) { return key in obj; };
			obj = Object(obj);
		}
		for (var i = 0, length = keys.length; i < length; i++) {
			var key = keys[i];
			var value = obj[key];
			if (iteratee(value, key, obj)) result[key] = value;
		}
		return result;
	};

	 // Return a copy of the object without the blacklisted properties.
	_.omit = function(obj, iteratee, context) {
		if (_.isFunction(iteratee)) {
			iteratee = _.negate(iteratee);
		} else {
			var keys = _.map(flatten(arguments, false, false, 1), String);
			iteratee = function(value, key) {
				return !_.contains(keys, key);
			};
		}
		return _.pick(obj, iteratee, context);
	};

	// Fill in a given object with default properties.
	_.defaults = createAssigner(_.allKeys, true);

	// Create a (shallow-cloned) duplicate of an object.
	_.clone = function(obj) {
		if (!_.isObject(obj)) return obj;
		return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	};
/*
	// Invokes interceptor with the obj, and then returns obj.
	// The primary purpose of this method is to "tap into" a method chain, in
	// order to perform operations on intermediate results within the chain.
	_.tap = function(obj, interceptor) {
		interceptor(obj);
		return obj;
	};

	// Returns whether an object has a given set of `key:value` pairs.
	_.isMatch = function(object, attrs) {
		var keys = _.keys(attrs), length = keys.length;
		if (object == null) return !length;
		var obj = Object(object);
		for (var i = 0; i < length; i++) {
			var key = keys[i];
			if (attrs[key] !== obj[key] || !(key in obj)) return false;
		}
		return true;
	};

	// Internal recursive comparison function for `isEqual`.
	var eq = function(a, b, aStack, bStack) {
		// Identical objects are equal. `0 === -0`, but they aren't identical.
		// See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
		if (a === b) return a !== 0 || 1 / a === 1 / b;
		// A strict comparison is necessary because `null == undefined`.
		if (a == null || b == null) return a === b;
		// Unwrap any wrapped objects.
		if (a instanceof _) a = a._wrapped;
		if (b instanceof _) b = b._wrapped;
		// Compare `[[Class]]` names.
		var className = toString.call(a);
		if (className !== toString.call(b)) return false;
		switch (className) {
			// Strings, numbers, regular expressions, dates, and booleans are compared by value.
			case '[object RegExp]':
			// RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
			case '[object String]':
				// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
				// equivalent to `new String("5")`.
				return '' + a === '' + b;
			case '[object Number]':
				// `NaN`s are equivalent, but non-reflexive.
				// Object(NaN) is equivalent to NaN
				if (+a !== +a) return +b !== +b;
				// An `egal` comparison is performed for other numeric values.
				return +a === 0 ? 1 / +a === 1 / b : +a === +b;
			case '[object Date]':
			case '[object Boolean]':
				// Coerce dates and booleans to numeric primitive values. Dates are compared by their
				// millisecond representations. Note that invalid dates with millisecond representations
				// of `NaN` are not equivalent.
				return +a === +b;
		}

		var areArrays = className === '[object Array]';
		if (!areArrays) {
			if (typeof a != 'object' || typeof b != 'object') return false;

			// Objects with different constructors are not equivalent, but `Object`s or `Array`s
			// from different frames are.
			var aCtor = a.constructor, bCtor = b.constructor;
			if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
															 _.isFunction(bCtor) && bCtor instanceof bCtor)
													&& ('constructor' in a && 'constructor' in b)) {
				return false;
			}
		}
		// Assume equality for cyclic structures. The algorithm for detecting cyclic
		// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

		// Initializing stack of traversed objects.
		// It's done here since we only need them for objects and arrays comparison.
		aStack = aStack || [];
		bStack = bStack || [];
		var length = aStack.length;
		while (length--) {
			// Linear search. Performance is inversely proportional to the number of
			// unique nested structures.
			if (aStack[length] === a) return bStack[length] === b;
		}

		// Add the first object to the stack of traversed objects.
		aStack.push(a);
		bStack.push(b);

		// Recursively compare objects and arrays.
		if (areArrays) {
			// Compare array lengths to determine if a deep comparison is necessary.
			length = a.length;
			if (length !== b.length) return false;
			// Deep compare the contents, ignoring non-numeric properties.
			while (length--) {
				if (!eq(a[length], b[length], aStack, bStack)) return false;
			}
		} else {
			// Deep compare objects.
			var keys = _.keys(a), key;
			length = keys.length;
			// Ensure that both objects contain the same number of properties before comparing deep equality.
			if (_.keys(b).length !== length) return false;
			while (length--) {
				// Deep compare each member
				key = keys[length];
				if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
			}
		}
		// Remove the first object from the stack of traversed objects.
		aStack.pop();
		bStack.pop();
		return true;
	};

	// Perform a deep comparison to check if two objects are equal.
	_.isEqual = function(a, b) {
		return eq(a, b);
	};
*/
	// Is a given array, string, or object empty?
	// An "empty" object has no enumerable own-properties.
	_.isEmpty = function(obj) {
		if (obj == null) return true;
		if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
		return _.keys(obj).length === 0;
	};

	// Is a given value a DOM element?
	_.isElement = function(obj) {
		return !!(obj && obj.nodeType === 1);
	};

	// Is a given value an array?
	// Delegates to ECMA5's native Array.isArray
	_.isArray = nativeIsArray || function(obj) {
		return toString.call(obj) === '[object Array]';
	};

	// Is a given variable an object?
	_.isObject = function(obj) {
		var type = typeof obj;
		return type === 'function' || type === 'object' && !!obj;
	};

	// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	_.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
		_['is' + name] = function(obj) {
			return toString.call(obj) === '[object ' + name + ']';
		};
	});

	// Define a fallback version of the method in browsers (ahem, IE < 9), where
	// there isn't any inspectable "Arguments" type.
	if (!_.isArguments(arguments)) {
		_.isArguments = function(obj) {
			return _.has(obj, 'callee');
		};
	}

	// Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	// IE 11 (#1621), and in Safari 8 (#1929).
	if (typeof /./ != 'function' && typeof Int8Array != 'object') {
		_.isFunction = function(obj) {
			return typeof obj == 'function' || false;
		};
	}
/*
	// Is a given object a finite number?
	_.isFinite = function(obj) {
		return isFinite(obj) && !isNaN(parseFloat(obj));
	};
*/
	// Is the given value `NaN`? (NaN is the only number which does not equal itself).
	_.isNaN = function(obj) {
		return _.isNumber(obj) && obj !== +obj;
	};

	// Is a given value a boolean?
	_.isBoolean = function(obj) {
		return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	};

	// Is a given value equal to null?
	_.isNull = function(obj) {
		return obj === null;
	};

	// Is a given variable undefined?
	_.isUndefined = function(obj) {
		return obj === void 0;
	};

	// Shortcut function for checking if an object has a given property directly
	// on itself (in other words, not on a prototype).
	_.has = function(obj, key) {
		return obj != null && hasOwnProperty.call(obj, key);
	};

	// Utility Functions
	// -----------------

	// Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	// previous owner. Returns a reference to the Underscore object.
	_.noConflict = function() {
		root._ = previousUnderscore;
		return this;
	};
/*
	// Keep the identity function around for default iteratees.
	_.identity = function(value) {
		return value;
	};

	// Predicate-generating functions. Often useful outside of Underscore.
	_.constant = function(value) {
		return function() {
			return value;
		};
	};

	_.noop = function(){};
*/
	_.property = function(key) {
		return function(obj) {
			return obj == null ? void 0 : obj[key];
		};
	};
/*
	// Generates a function for a given object that returns a given property.
	_.propertyOf = function(obj) {
		return obj == null ? function(){} : function(key) {
			return obj[key];
		};
	};

	// Returns a predicate for checking whether an object has a given set of
	// `key:value` pairs.
	_.matcher = _.matches = function(attrs) {
		attrs = _.extendOwn({}, attrs);
		return function(obj) {
			return _.isMatch(obj, attrs);
		};
	};

	// Run a function **n** times.
	_.times = function(n, iteratee, context) {
		var accum = Array(Math.max(0, n));
		iteratee = optimizeCb(iteratee, context, 1);
		for (var i = 0; i < n; i++) accum[i] = iteratee(i);
		return accum;
	};
*/
	// Return a random integer between min and max (inclusive).
	_.random = function(min, max) {
		if (max == null) {
			max = min;
			min = 0;
		}
		return min + Math.floor(Math.random() * (max - min + 1));
	};
/*
	// A (possibly faster) way to get the current timestamp as an integer.
	_.now = Date.now || function() {
		return new Date().getTime();
	};
*/
	 // List of HTML entities for escaping.
	var escapeMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;',
		'`': '&#x60;'
	};
	var unescapeMap = _.invert(escapeMap);

	// Functions for escaping and unescaping strings to/from HTML interpolation.
	var createEscaper = function(map) {
		var escaper = function(match) {
			return map[match];
		};
		// Regexes for identifying a key that needs to be escaped
		var source = '(?:' + _.keys(map).join('|') + ')';
		var testRegexp = RegExp(source);
		var replaceRegexp = RegExp(source, 'g');
		return function(string) {
			string = string == null ? '' : '' + string;
			return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
		};
	};
	_.escape = createEscaper(escapeMap);
	_.unescape = createEscaper(unescapeMap);
/*
	// If the value of the named `property` is a function then invoke it with the
	// `object` as context; otherwise, return it.
	_.result = function(object, property, fallback) {
		var value = object == null ? void 0 : object[property];
		if (value === void 0) {
			value = fallback;
		}
		return _.isFunction(value) ? value.call(object) : value;
	};
*/
	// Generate a unique integer id (unique within the entire client session).
	// Useful for temporary DOM ids.
	var idCounter = 0;
	_.uniqueId = function(prefix) {
		var id = ++idCounter + '';
		return prefix ? prefix + id : id;
	};

	// By default, Underscore uses ERB-style template delimiters, change the
	// following template settings to use alternative delimiters.
	_.templateSettings = {
		evaluate    : /<%([\s\S]+?)%>/g,
		interpolate : /<%=([\s\S]+?)%>/g,
		escape      : /<%-([\s\S]+?)%>/g
	};

	// When customizing `templateSettings`, if you don't want to define an
	// interpolation, evaluation or escaping regex, we need one that is
	// guaranteed not to match.
	var noMatch = /(.)^/;

	// Certain characters need to be escaped so that they can be put into a
	// string literal.
	var escapes = {
		"'":      "'",
		'\\':     '\\',
		'\r':     'r',
		'\n':     'n',
		'\u2028': 'u2028',
		'\u2029': 'u2029'
	};

	var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	var escapeChar = function(match) {
		return '\\' + escapes[match];
	};

	// JavaScript micro-templating, similar to John Resig's implementation.
	// Underscore templating handles arbitrary delimiters, preserves whitespace,
	// and correctly escapes quotes within interpolated code.
	// NB: `oldSettings` only exists for backwards compatibility.
	_.template = function(text, settings, oldSettings) {
		if (!settings && oldSettings) settings = oldSettings;
		settings = _.defaults({}, settings, _.templateSettings);

		// Combine delimiters into one regular expression via alternation.
		var matcher = RegExp([
			(settings.escape || noMatch).source,
			(settings.interpolate || noMatch).source,
			(settings.evaluate || noMatch).source
		].join('|') + '|$', 'g');

		// Compile the template source, escaping string literals appropriately.
		var index = 0;
		var source = "__p+='";
		text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
			source += text.slice(index, offset).replace(escaper, escapeChar);
			index = offset + match.length;

			if (escape) {
				source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
			} else if (interpolate) {
				source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
			} else if (evaluate) {
				source += "';\n" + evaluate + "\n__p+='";
			}

			// Adobe VMs need the match returned to produce the correct offest.
			return match;
		});
		source += "';\n";

		// If a variable is not specified, place data values in local scope.
		if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

		source = "var __t,__p='',__j=Array.prototype.join," +
			"print=function(){__p+=__j.call(arguments,'');};\n" +
			source + 'return __p;\n';

		try {
			var render = new Function(settings.variable || 'obj', '_', source);
		} catch (e) {
			e.source = source;
			throw e;
		}

		var template = function(data) {
			return render.call(this, data, _);
		};

		// Provide the compiled source as a convenience for precompilation.
		var argument = settings.variable || 'obj';
		template.source = 'function(' + argument + '){\n' + source + '}';

		return template;
	};

	// Add a "chain" function. Start chaining a wrapped Underscore object.
	_.chain = function(obj) {
		var instance = _(obj);
		instance._chain = true;
		return instance;
	};

	// OOP
	// ---------------
	// If Underscore is called as a function, it returns a wrapped object that
	// can be used OO-style. This wrapper holds altered versions of all the
	// underscore functions. Wrapped objects may be chained.

	// Helper function to continue chaining intermediate results.
	var result = function(instance, obj) {
		return instance._chain ? _(obj).chain() : obj;
	};

	// Add your own custom functions to the Underscore object.
	_.mixin = function(obj) {
		_.each(_.functions(obj), function(name) {
			var func = _[name] = obj[name];
			_.prototype[name] = function() {
				var args = [this._wrapped];
				push.apply(args, arguments);
				return result(this, func.apply(_, args));
			};
		});
	};

	// Add all of the Underscore functions to the wrapper object.
	_.mixin(_);
/*
	// Add all mutator Array functions to the wrapper.
	_.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
		var method = ArrayProto[name];
		_.prototype[name] = function() {
			var obj = this._wrapped;
			method.apply(obj, arguments);
			if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
			return result(this, obj);
		};
	});

	// Add all accessor Array functions to the wrapper.
	_.each(['concat', 'join', 'slice'], function(name) {
		var method = ArrayProto[name];
		_.prototype[name] = function() {
			return result(this, method.apply(this._wrapped, arguments));
		};
	});
*/
	// Extracts the result from a wrapped and chained object.
	_.prototype.value = function() {
		return this._wrapped;
	};

	// Provide unwrapping proxy for some methods used in engine operations
	// such as arithmetic and JSON stringification.
	_.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	_.prototype.toString = function() {
		return '' + this._wrapped;
	};

	// AMD registration happens at the end for compatibility with AMD loaders
	// that may not enforce next-turn semantics on modules. Even though general
	// practice for AMD registration is to be anonymous, underscore registers
	// as a named module because, like jQuery, it is a base library that is
	// popular enough to be bundled in a third party lib, but not be part of
	// an AMD load request. Those cases could generate an error when an
	// anonymous define() is called outside of a loader request.
	if (typeof define === 'function' && define.amd) {
		define('underscore', [], function() {
			return _;
		});
	}
}.call(this));

//*********************
//END OF UNDERSCORE.JS
//*********************

//just to be sure in case underscore is already used on another of our site (an old version is on our cdn)
__ = _.noConflict();
/*!	SWFObject v2.2 <http://code.google.com/p/swfobject/>
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/

var swfobject = function() {

	var UNDEF = "undefined",
		OBJECT = "object",
		SHOCKWAVE_FLASH = "Shockwave Flash",
		SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
		FLASH_MIME_TYPE = "application/x-shockwave-flash",
		EXPRESS_INSTALL_ID = "SWFObjectExprInst",
		ON_READY_STATE_CHANGE = "onreadystatechange",

		win = window,
		doc = document,
		nav = navigator,

		plugin = false,
		domLoadFnArr = [main],
		regObjArr = [],
		objIdArr = [],
		listenersArr = [],
		storedAltContent,
		storedAltContentId,
		storedCallbackFn,
		storedCallbackObj,
		isDomLoaded = false,
		isExpressInstallActive = false,
		dynamicStylesheet,
		dynamicStylesheetMedia,
		autoHideShow = true,

	/* Centralized function for browser feature detection
		- User agent string detection is only used when no good alternative is possible
		- Is executed directly for optimal performance
	*/
	ua = function() {
		var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
			u = nav.userAgent.toLowerCase(),
			p = nav.platform.toLowerCase(),
			windows = p ? /win/.test(p) : /win/.test(u),
			mac = p ? /mac/.test(p) : /mac/.test(u),
			webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
			ie = !+"\v1", // feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
			playerVersion = [0,0,0],
			d = null;
		if (typeof nav.plugins != UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] == OBJECT) {
			d = nav.plugins[SHOCKWAVE_FLASH].description;
			if (d && !(typeof nav.mimeTypes != UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) { // navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
				plugin = true;
				ie = false; // cascaded feature detection for Internet Explorer
				d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
				playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
				playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
				playerVersion[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
			}
		}
		else if (typeof win.ActiveXObject != UNDEF) {
			try {
				var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
				if (a) { // a will return null when ActiveX is disabled
					d = a.GetVariable("$version");
					if (d) {
						ie = true; // cascaded feature detection for Internet Explorer
						d = d.split(" ")[1].split(",");
						playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
					}
				}
			}
			catch(e) {}
		}
		return { w3:w3cdom, pv:playerVersion, wk:webkit, ie:ie, win:windows, mac:mac };
	}(),

	/* Cross-browser onDomLoad
		- Will fire an event as soon as the DOM of a web page is loaded
		- Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
		- Regular onload serves as fallback
	*/
	onDomLoad = function() {
		if (!ua.w3) { return; }
		if ((typeof doc.readyState != UNDEF && doc.readyState == "complete") || (typeof doc.readyState == UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically
			callDomLoadFunctions();
		}
		if (!isDomLoaded) {
			if (typeof doc.addEventListener != UNDEF) {
				doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
			}
			if (ua.ie && ua.win) {
				doc.attachEvent(ON_READY_STATE_CHANGE, function() {
					if (doc.readyState == "complete") {
						doc.detachEvent(ON_READY_STATE_CHANGE, arguments.callee);
						callDomLoadFunctions();
					}
				});
				if (win == top) { // if not inside an iframe
					(function(){
						if (isDomLoaded) { return; }
						try {
							doc.documentElement.doScroll("left");
						}
						catch(e) {
							setTimeout(arguments.callee, 0);
							return;
						}
						callDomLoadFunctions();
					})();
				}
			}
			if (ua.wk) {
				(function(){
					if (isDomLoaded) { return; }
					if (!/loaded|complete/.test(doc.readyState)) {
						setTimeout(arguments.callee, 0);
						return;
					}
					callDomLoadFunctions();
				})();
			}
			addLoadEvent(callDomLoadFunctions);
		}
	}();

	function callDomLoadFunctions() {
		if (isDomLoaded) { return; }
		try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
			var t = doc.getElementsByTagName("body")[0].appendChild(createElement("span"));
			t.parentNode.removeChild(t);
		}
		catch (e) { return; }
		isDomLoaded = true;
		var dl = domLoadFnArr.length;
		for (var i = 0; i < dl; i++) {
			domLoadFnArr[i]();
		}
	}

	function addDomLoadEvent(fn) {
		if (isDomLoaded) {
			fn();
		}
		else {
			domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
		}
	}

	/* Cross-browser onload
		- Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
		- Will fire an event as soon as a web page including all of its assets are loaded
	 */
	function addLoadEvent(fn) {
		if (typeof win.addEventListener != UNDEF) {
			win.addEventListener("load", fn, false);
		}
		else if (typeof doc.addEventListener != UNDEF) {
			doc.addEventListener("load", fn, false);
		}
		else if (typeof win.attachEvent != UNDEF) {
			addListener(win, "onload", fn);
		}
		else if (typeof win.onload == "function") {
			var fnOld = win.onload;
			win.onload = function() {
				fnOld();
				fn();
			};
		}
		else {
			win.onload = fn;
		}
	}

	/* Main function
		- Will preferably execute onDomLoad, otherwise onload (as a fallback)
	*/
	function main() {
		if (plugin) {
			testPlayerVersion();
		}
		else {
			matchVersions();
		}
	}

	/* Detect the Flash Player version for non-Internet Explorer browsers
		- Detecting the plug-in version via the object element is more precise than using the plugins collection item's description:
		  a. Both release and build numbers can be detected
		  b. Avoid wrong descriptions by corrupt installers provided by Adobe
		  c. Avoid wrong descriptions by multiple Flash Player entries in the plugin Array, caused by incorrect browser imports
		- Disadvantage of this method is that it depends on the availability of the DOM, while the plugins collection is immediately available
	*/
	function testPlayerVersion() {
		var b = doc.getElementsByTagName("body")[0];
		var o = createElement(OBJECT);
		o.setAttribute("type", FLASH_MIME_TYPE);
		var t = b.appendChild(o);
		if (t) {
			var counter = 0;
			(function(){
				if (typeof t.GetVariable != UNDEF) {
					var d = t.GetVariable("$version");
					if (d) {
						d = d.split(" ")[1].split(",");
						ua.pv = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
					}
				}
				else if (counter < 10) {
					counter++;
					setTimeout(arguments.callee, 10);
					return;
				}
				b.removeChild(o);
				t = null;
				matchVersions();
			})();
		}
		else {
			matchVersions();
		}
	}

	/* Perform Flash Player and SWF version matching; static publishing only
	*/
	function matchVersions() {
		var rl = regObjArr.length;
		if (rl > 0) {
			for (var i = 0; i < rl; i++) { // for each registered object element
				var id = regObjArr[i].id;
				var cb = regObjArr[i].callbackFn;
				var cbObj = {success:false, id:id};
				if (ua.pv[0] > 0) {
					var obj = getElementById(id);
					if (obj) {
						if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) { // Flash Player version >= published SWF version: Houston, we have a match!
							setVisibility(id, true);
							if (cb) {
								cbObj.success = true;
								cbObj.ref = getObjectById(id);
								cb(cbObj);
							}
						}
						else if (regObjArr[i].expressInstall && canExpressInstall()) { // show the Adobe Express Install dialog if set by the web page author and if supported
							var att = {};
							att.data = regObjArr[i].expressInstall;
							att.width = obj.getAttribute("width") || "0";
							att.height = obj.getAttribute("height") || "0";
							if (obj.getAttribute("class")) { att.styleclass = obj.getAttribute("class"); }
							if (obj.getAttribute("align")) { att.align = obj.getAttribute("align"); }
							// parse HTML object param element's name-value pairs
							var par = {};
							var p = obj.getElementsByTagName("param");
							var pl = p.length;
							for (var j = 0; j < pl; j++) {
								if (p[j].getAttribute("name").toLowerCase() != "movie") {
									par[p[j].getAttribute("name")] = p[j].getAttribute("value");
								}
							}
							showExpressInstall(att, par, id, cb);
						}
						else { // Flash Player and SWF version mismatch or an older Webkit engine that ignores the HTML object element's nested param elements: display alternative content instead of SWF
							displayAltContent(obj);
							if (cb) { cb(cbObj); }
						}
					}
				}
				else {	// if no Flash Player is installed or the fp version cannot be detected we let the HTML object element do its job (either show a SWF or alternative content)
					setVisibility(id, true);
					if (cb) {
						var o = getObjectById(id); // test whether there is an HTML object element or not
						if (o && typeof o.SetVariable != UNDEF) {
							cbObj.success = true;
							cbObj.ref = o;
						}
						cb(cbObj);
					}
				}
			}
		}
	}

	function getObjectById(objectIdStr) {
		var r = null;
		var o = getElementById(objectIdStr);
		if (o && o.nodeName == "OBJECT") {
			if (typeof o.SetVariable != UNDEF) {
				r = o;
			}
			else {
				var n = o.getElementsByTagName(OBJECT)[0];
				if (n) {
					r = n;
				}
			}
		}
		return r;
	}

	/* Requirements for Adobe Express Install
		- only one instance can be active at a time
		- fp 6.0.65 or higher
		- Win/Mac OS only
		- no Webkit engines older than version 312
	*/
	function canExpressInstall() {
		return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
	}

	/* Show the Adobe Express Install dialog
		- Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
	*/
	function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {
		isExpressInstallActive = true;
		storedCallbackFn = callbackFn || null;
		storedCallbackObj = {success:false, id:replaceElemIdStr};
		var obj = getElementById(replaceElemIdStr);
		if (obj) {
			if (obj.nodeName == "OBJECT") { // static publishing
				storedAltContent = abstractAltContent(obj);
				storedAltContentId = null;
			}
			else { // dynamic publishing
				storedAltContent = obj;
				storedAltContentId = replaceElemIdStr;
			}
			att.id = EXPRESS_INSTALL_ID;
			if (typeof att.width == UNDEF || (!/%$/.test(att.width) && parseInt(att.width, 10) < 310)) { att.width = "310"; }
			if (typeof att.height == UNDEF || (!/%$/.test(att.height) && parseInt(att.height, 10) < 137)) { att.height = "137"; }
			doc.title = doc.title.slice(0, 47) + " - Flash Player Installation";
			var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn",
				fv = "MMredirectURL=" + encodeURI(win.location).toString().replace(/&/g,"%26") + "&MMplayerType=" + pt + "&MMdoctitle=" + doc.title;
			if (typeof par.flashvars != UNDEF) {
				par.flashvars += "&" + fv;
			}
			else {
				par.flashvars = fv;
			}
			// IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
			// because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
			if (ua.ie && ua.win && obj.readyState != 4) {
				var newObj = createElement("div");
				replaceElemIdStr += "SWFObjectNew";
				newObj.setAttribute("id", replaceElemIdStr);
				obj.parentNode.insertBefore(newObj, obj); // insert placeholder div that will be replaced by the object element that loads expressinstall.swf
				obj.style.display = "none";
				(function(){
					if (obj.readyState == 4) {
						obj.parentNode.removeChild(obj);
					}
					else {
						setTimeout(arguments.callee, 10);
					}
				})();
			}
			createSWF(att, par, replaceElemIdStr);
		}
	}

	/* Functions to abstract and display alternative content
	*/
	function displayAltContent(obj) {
		if (ua.ie && ua.win && obj.readyState != 4) {
			// IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
			// because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
			var el = createElement("div");
			obj.parentNode.insertBefore(el, obj); // insert placeholder div that will be replaced by the alternative content
			el.parentNode.replaceChild(abstractAltContent(obj), el);
			obj.style.display = "none";
			(function(){
				if (obj.readyState == 4) {
					obj.parentNode.removeChild(obj);
				}
				else {
					setTimeout(arguments.callee, 10);
				}
			})();
		}
		else {
			obj.parentNode.replaceChild(abstractAltContent(obj), obj);
		}
	}

	function abstractAltContent(obj) {
		var ac = createElement("div");
		if (ua.win && ua.ie) {
			ac.innerHTML = obj.innerHTML;
		}
		else {
			var nestedObj = obj.getElementsByTagName(OBJECT)[0];
			if (nestedObj) {
				var c = nestedObj.childNodes;
				if (c) {
					var cl = c.length;
					for (var i = 0; i < cl; i++) {
						if (!(c[i].nodeType == 1 && c[i].nodeName == "PARAM") && !(c[i].nodeType == 8)) {
							ac.appendChild(c[i].cloneNode(true));
						}
					}
				}
			}
		}
		return ac;
	}

	/* Cross-browser dynamic SWF creation
	*/
	function createSWF(attObj, parObj, id) {
		var r, el = getElementById(id);
		if (ua.wk && ua.wk < 312) { return r; }
		if (el) {
			if (typeof attObj.id == UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the alternative content
				attObj.id = id;
			}
			if (ua.ie && ua.win) { // Internet Explorer + the HTML object element + W3C DOM methods do not combine: fall back to outerHTML
				var att = "";
				for (var i in attObj) {
					if (attObj[i] != Object.prototype[i]) { // filter out prototype additions from other potential libraries
						if (i.toLowerCase() == "data") {
							parObj.movie = attObj[i];
						}
						else if (i.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
							att += ' class="' + attObj[i] + '"';
						}
						else if (i.toLowerCase() != "classid") {
							att += ' ' + i + '="' + attObj[i] + '"';
						}
					}
				}
				var par = "";
				for (var j in parObj) {
					if (parObj[j] != Object.prototype[j]) { // filter out prototype additions from other potential libraries
						par += '<param name="' + j + '" value="' + parObj[j] + '" />';
					}
				}
				el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
				objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
				r = getElementById(attObj.id);
			}
			else { // well-behaving browsers
				var o = createElement(OBJECT);
				o.setAttribute("type", FLASH_MIME_TYPE);
				for (var m in attObj) {
					if (attObj[m] != Object.prototype[m]) { // filter out prototype additions from other potential libraries
						if (m.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
							o.setAttribute("class", attObj[m]);
						}
						else if (m.toLowerCase() != "classid") { // filter out IE specific attribute
							o.setAttribute(m, attObj[m]);
						}
					}
				}
				for (var n in parObj) {
					if (parObj[n] != Object.prototype[n] && n.toLowerCase() != "movie") { // filter out prototype additions from other potential libraries and IE specific param element
						createObjParam(o, n, parObj[n]);
					}
				}
				el.parentNode.replaceChild(o, el);
				r = o;
			}
		}
		return r;
	}

	function createObjParam(el, pName, pValue) {
		var p = createElement("param");
		p.setAttribute("name", pName);
		p.setAttribute("value", pValue);
		el.appendChild(p);
	}

	/* Cross-browser SWF removal
		- Especially needed to safely and completely remove a SWF in Internet Explorer
	*/
	function removeSWF(id) {
		var obj = getElementById(id);
		if (obj && obj.nodeName == "OBJECT") {
			if (ua.ie && ua.win) {
				obj.style.display = "none";
				(function(){
					if (obj.readyState == 4) {
						removeObjectInIE(id);
					}
					else {
						setTimeout(arguments.callee, 10);
					}
				})();
			}
			else {
				obj.parentNode.removeChild(obj);
			}
		}
	}

	function removeObjectInIE(id) {
		var obj = getElementById(id);
		if (obj) {
			for (var i in obj) {
				if (typeof obj[i] == "function") {
					obj[i] = null;
				}
			}
			obj.parentNode.removeChild(obj);
		}
	}

	/* Functions to optimize JavaScript compression
	*/
	function getElementById(id) {
		var el = null;
		try {
			el = doc.getElementById(id);
		}
		catch (e) {}
		return el;
	}

	function createElement(el) {
		return doc.createElement(el);
	}

	/* Updated attachEvent function for Internet Explorer
		- Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
	*/
	function addListener(target, eventType, fn) {
		target.attachEvent(eventType, fn);
		listenersArr[listenersArr.length] = [target, eventType, fn];
	}

	/* Flash Player and SWF content version matching
	*/
	function hasPlayerVersion(rv) {
		var pv = ua.pv, v = rv.split(".");
		v[0] = parseInt(v[0], 10);
		v[1] = parseInt(v[1], 10) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
		v[2] = parseInt(v[2], 10) || 0;
		return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
	}

	/* Cross-browser dynamic CSS creation
		- Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
	*/
	function createCSS(sel, decl, media, newStyle) {
		if (ua.ie && ua.mac) { return; }
		var h = doc.getElementsByTagName("head")[0];
		if (!h) { return; } // to also support badly authored HTML pages that lack a head element
		var m = (media && typeof media == "string") ? media : "screen";
		if (newStyle) {
			dynamicStylesheet = null;
			dynamicStylesheetMedia = null;
		}
		if (!dynamicStylesheet || dynamicStylesheetMedia != m) {
			// create dynamic stylesheet + get a global reference to it
			var s = createElement("style");
			s.setAttribute("type", "text/css");
			s.setAttribute("media", m);
			dynamicStylesheet = h.appendChild(s);
			if (ua.ie && ua.win && typeof doc.styleSheets != UNDEF && doc.styleSheets.length > 0) {
				dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
			}
			dynamicStylesheetMedia = m;
		}
		// add style rule
		if (ua.ie && ua.win) {
			if (dynamicStylesheet && typeof dynamicStylesheet.addRule == OBJECT) {
				dynamicStylesheet.addRule(sel, decl);
			}
		}
		else {
			if (dynamicStylesheet && typeof doc.createTextNode != UNDEF) {
				dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
			}
		}
	}

	function setVisibility(id, isVisible) {
		if (!autoHideShow) { return; }
		var v = isVisible ? "visible" : "hidden";
		if (isDomLoaded && getElementById(id)) {
			getElementById(id).style.visibility = v;
		}
		else {
			createCSS("#" + id, "visibility:" + v);
		}
	}

	/* Filter to avoid XSS attacks
	*/
	function urlEncodeIfNecessary(s) {
		var regex = /[\\\"<>\.;]/;
		var hasBadChars = regex.exec(s) != null;
		return hasBadChars && typeof encodeURIComponent != UNDEF ? encodeURIComponent(s) : s;
	}

	/* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
	*/
	var cleanup = function() {
		if (ua.ie && ua.win) {
			window.attachEvent("onunload", function() {
				// remove listeners to avoid memory leaks
				var ll = listenersArr.length;
				for (var i = 0; i < ll; i++) {
					listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
				}
				// cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
				/*var il = objIdArr.length;
				for (var j = 0; j < il; j++) {
					removeSWF(objIdArr[j]);
				}*/
				// cleanup library's main closures to avoid memory leaks
				for (var k in ua) {
					ua[k] = null;
				}
				ua = null;
				for (var l in swfobject) {
					swfobject[l] = null;
				}
				swfobject = null;
			});
		}
	}();

	return {
		/* Public API
			- Reference: http://code.google.com/p/swfobject/wiki/documentation
		*/
		registerObject: function(objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
			if (ua.w3 && objectIdStr && swfVersionStr) {
				var regObj = {};
				regObj.id = objectIdStr;
				regObj.swfVersion = swfVersionStr;
				regObj.expressInstall = xiSwfUrlStr;
				regObj.callbackFn = callbackFn;
				regObjArr[regObjArr.length] = regObj;
				setVisibility(objectIdStr, false);
			}
			else if (callbackFn) {
				callbackFn({success:false, id:objectIdStr});
			}
		},

		getObjectById: function(objectIdStr) {
			if (ua.w3) {
				return getObjectById(objectIdStr);
			}
		},

		embedSWF: function(swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {
			var callbackObj = {success:false, id:replaceElemIdStr};
			if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
				setVisibility(replaceElemIdStr, false);
				addDomLoadEvent(function() {
					widthStr += ""; // auto-convert to string
					heightStr += "";
					var att = {};
					if (attObj && typeof attObj === OBJECT) {
						for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
							att[i] = attObj[i];
						}
					}
					att.data = swfUrlStr;
					att.width = widthStr;
					att.height = heightStr;
					var par = {};
					if (parObj && typeof parObj === OBJECT) {
						for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
							par[j] = parObj[j];
						}
					}
					if (flashvarsObj && typeof flashvarsObj === OBJECT) {
						for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
							if (typeof par.flashvars != UNDEF) {
								par.flashvars += "&" + k + "=" + flashvarsObj[k];
							}
							else {
								par.flashvars = k + "=" + flashvarsObj[k];
							}
						}
					}
					if (hasPlayerVersion(swfVersionStr)) { // create SWF
						var obj = createSWF(att, par, replaceElemIdStr);
						if (att.id == replaceElemIdStr) {
							setVisibility(replaceElemIdStr, true);
						}
						callbackObj.success = true;
						callbackObj.ref = obj;
					}
					else if (xiSwfUrlStr && canExpressInstall()) { // show Adobe Express Install
						att.data = xiSwfUrlStr;
						showExpressInstall(att, par, replaceElemIdStr, callbackFn);
						return;
					}
					else { // show alternative content
						setVisibility(replaceElemIdStr, true);
					}
					if (callbackFn) { callbackFn(callbackObj); }
				});
			}
			else if (callbackFn) { callbackFn(callbackObj);	}
		},

		switchOffAutoHideShow: function() {
			autoHideShow = false;
		},

		ua: ua,

		getFlashPlayerVersion: function() {
			return { major:ua.pv[0], minor:ua.pv[1], release:ua.pv[2] };
		},

		hasFlashPlayerVersion: hasPlayerVersion,

		createSWF: function(attObj, parObj, replaceElemIdStr) {
			if (ua.w3) {
				return createSWF(attObj, parObj, replaceElemIdStr);
			}
			else {
				return undefined;
			}
		},

		showExpressInstall: function(att, par, replaceElemIdStr, callbackFn) {
			if (ua.w3 && canExpressInstall()) {
				showExpressInstall(att, par, replaceElemIdStr, callbackFn);
			}
		},

		removeSWF: function(objElemIdStr) {
			if (ua.w3) {
				removeSWF(objElemIdStr);
			}
		},

		createCSS: function(selStr, declStr, mediaStr, newStyleBoolean) {
			if (ua.w3) {
				createCSS(selStr, declStr, mediaStr, newStyleBoolean);
			}
		},

		addDomLoadEvent: addDomLoadEvent,

		addLoadEvent: addLoadEvent,

		getQueryParamValue: function(param) {
			var q = doc.location.search || doc.location.hash;
			if (q) {
				if (/\?/.test(q)) { q = q.split("?")[1]; } // strip question mark
				if (param == null) {
					return urlEncodeIfNecessary(q);
				}
				var pairs = q.split("&");
				for (var i = 0; i < pairs.length; i++) {
					if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
						return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
					}
				}
			}
			return "";
		},

		// For internal usage only
		expressInstallCallback: function() {
			if (isExpressInstallActive) {
				var obj = getElementById(EXPRESS_INSTALL_ID);
				if (obj && storedAltContent) {
					obj.parentNode.replaceChild(storedAltContent, obj);
					if (storedAltContentId) {
						setVisibility(storedAltContentId, true);
						if (ua.ie && ua.win) { storedAltContent.style.display = "block"; }
					}
					if (storedCallbackFn) { storedCallbackFn(storedCallbackObj); }
				}
				isExpressInstallActive = false;
			}
		}
	};
}();
/*
    json2.js
    2015-05-03

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse. This file is provides the ES5 JSON capability to ES3 systems.
    If a project might run on IE8 or earlier, then this file should be included.
    This file does nothing on ES5 systems.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10
                            ? '0' + n
                            : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date
                    ? 'Date(' + this[key] + ')'
                    : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint
    eval, for, this
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    var rx_one = /^[\],:{}\s]*$/,
        rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rx_four = /(?:^|:|,)(?:\s*\[)+/g,
        rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10
            ? '0' + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                        f(this.getUTCMonth() + 1) + '-' +
                        f(this.getUTCDate()) + 'T' +
                        f(this.getUTCHours()) + ':' +
                        f(this.getUTCMinutes()) + ':' +
                        f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap,
        indent,
        meta,
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? '"' + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"'
            : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value)
                ? String(value)
                : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ': '
                                    : ':'
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ': '
                                    : ':'
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, '@')
                        .replace(rx_three, ']')
                        .replace(rx_four, '')
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
	var store = {};
	try {
		var storage = window.localStorage;
	} catch (e) {
		var storage = {};
	}

	store.has = function(key) { return store.get(key) !== undefined }
	store.serialize = function(value) {
		return JSON.stringify(value)
	}
	store.deserialize = function(value) {
		if (typeof value != 'string') { return undefined }
		try {
			return JSON.parse(value) }
		catch(e) {
			return value || undefined
		}
	}

	store.remove = function(key) {
		try {
			storage.removeItem(key);
		} catch(e) {}
	}

	store.set = function(key, val) {
		if (val === undefined) { return store.remove(key) }
		// mac safari in incognito mode throws exceptions on setItem calls
		try {
			storage.setItem(key, store.serialize(val))
		} catch (e) {
			return false;
		}
		return val
	}

	store.get = function(key, defaultVal) {
		try {
			var val = store.deserialize(storage.getItem(key))
		} catch(e) {

		}
		return (val === undefined ? defaultVal : val)
	}

	window.store = store;

//https://gist.github.com/kurtmilam/1868955
//same as _.extend, except it work with more than one level
__.mixin({ 'deepExtend': function(obj){
	var parentRE = /#{\s*?_\s*?}/,
	slice = Array.prototype.slice;

	__.each(slice.call(arguments, 1), function(source) {
		for (var prop in source) {
			if (__.isUndefined(obj[prop]) || __.isFunction(obj[prop]) || __.isNull(source[prop]) || __.isDate(source[prop])) {
				obj[prop] = source[prop];
			}
			else if (__.isString(source[prop]) && parentRE.test(source[prop])) {
				if (__.isString(obj[prop])) {
					obj[prop] = source[prop].replace(parentRE, obj[prop]);
				}
			}
			else if (__.isArray(obj[prop]) || __.isArray(source[prop])){
				if (!__.isArray(obj[prop]) || !__.isArray(source[prop])){
					throw new Error('Trying to combine an array with a non-array (' + prop + ')');
				} else {
					obj[prop] = __.reject(__.deepExtend(__.clone(obj[prop]), source[prop]), function (item) { return __.isNull(item);});
				}
			}
			else if (__.isObject(obj[prop]) || __.isObject(source[prop])){
				if (!__.isObject(obj[prop]) || !__.isObject(source[prop])){
					throw new Error('Trying to combine an object with a non-object (' + prop + ')');
				} else {
					obj[prop] = __.deepExtend(__.clone(obj[prop]), source[prop]);
				}
			} else {
				obj[prop] = source[prop];
			}
		}
	});
	return obj;
}});

//create element function from modernizr 2.8.3 so we can use some of their test whitout the full library.
//https://github.com/Modernizr/Modernizr/blob/9d6ed728f17a1e58d6eef3266eea4613ef459ea1/src/createElement.js
var createElement = function() {
	if (typeof document.createElement !== 'function') {
		// This is the case in IE7, where the type of createElement is "object".
		// For this reason, we cannot call apply() as Object is not a Function.
		return document.createElement(arguments[0]);
	} else {
		return document.createElement.apply(document, arguments);
	}
};

//HTML5 VIDEO SUPPORT DETECTION
//Detect if the specified video format is supported.
//Adapted from modernizr 2.8.3 video test
//https://github.com/Modernizr/Modernizr/blob/master/feature-detects/video.js
//Take a format[string] and return a bool
__.mixin({
	videoFormatIsSupported: function(videoFormat){
		var codecs = {
				ogg:  'video/ogg; codecs="theora"',
				h264: 'video/mp4; codecs="avc1.42E01E"',
				webm: 'video/webm; codecs="vp8, vorbis"',
				vp9:  'video/webm; codecs="vp9"',
				hls:  'application/x-mpegURL; codecs="avc1.42E01E"'
			},
			elem = createElement('video'),
			bool = false;

		var codec = __.find(codecs, function(v,k){
			return k == videoFormat;
		});

		if(codec){
			try{
				if ( bool = !!elem.canPlayType ) {
					bool = elem.canPlayType(codec).replace(/^no$/,'');
				}
			} catch(e){}
		}

		return !!bool;
	}
});

//extract the filename from a path.
__.mixin({ pathToFileName: MHP1138.pathToFileName });

//get the value of a querystring or return null if it don't exist.
__.mixin({ getParameterByName: MHP1138.getParameterByName });

//extract file extention from complete path or filename
__.mixin({
	extractFileExtention: function(path){
		return path.split('?')[0].split('.').pop();
	}
});

//determine if the string is a path
//return true if it found either a slash or a dot
__.mixin({
	isPath: function(string){
		return /.*(\/.*|\..*)+/.test(string);
	}
});

var mhp_prefix = 'mhp1138_';
//CLASSLIST SUPPORT FOR IE9 AND LESS
//Redirect to classList methods on modern browser where classList issupported
//Use some regex to emulate the same stuff where classList is not supported
__.mixin((!__.isUndefined(document.documentElement.classList)) ? {
	addClass: function(e, name) {
		if (name.indexOf(mhp_prefix) == -1)
			name = mhp_prefix + name;
		e.classList.add(name);
	},
	removeClass: function(e, name){
		if (name.indexOf(mhp_prefix) == -1)
			name = mhp_prefix + name;
		e.classList.remove(name);
	},
	hasClass: function(e, name){
		if (name.indexOf(mhp_prefix) == -1)
			name = mhp_prefix + name;
		return e.classList.contains(name);
	},
	toggleClass: function(e, name){
		if (name.indexOf(mhp_prefix) == -1)
			name = mhp_prefix + name;
		e.classList.toggle(name);
	}
} : {
	addClass: function(e, name){
		if (name.indexOf(mhp_prefix) == -1)
			name = mhp_prefix + name;
		if (!__.hasClass(e, name))
			e.className += (e.className ? ' ' : '') + name;
	},
	removeClass: function(e, name){
		if (name.indexOf(mhp_prefix) == -1)
			name = mhp_prefix + name;
		if (__.hasClass(e, name))
			e.className = e.className.replace(new RegExp('(^|\\s)*' + name + '(\\s|$)*', 'g'), '');
	},
	hasClass: function(e, name){
		if (name.indexOf(mhp_prefix) == -1)
			name = mhp_prefix + name;
		return new RegExp('(^|\\s)' + name + '(\\s|$)').test(e.className);
	},
	toggleClass: function(e, name){
		if (name.indexOf(mhp_prefix) == -1)
			name = mhp_prefix + name;
		( __.hasClass(e, name) ? __.removeClass : __.addClass )(e, name);
	}
});

//filter and return only the video resolution that have a valid numerical key and a string as a value
__.mixin({
	filterVideoResolution: function(sources){

		return __.filter(__.keys(sources), function(resolution){

			return __.isString(sources[resolution])
				&& sources[resolution].length
				&& __.isPath(sources[resolution]);

		});
	}
});

// this function clean the memory when you delete elements to prevent a memory leak on IE7-9
// http://javascript.crockford.com/memory/leak.html
__.mixin({
	purge: function(d){
		var a = d.attributes, i, l, n;
		if (a) {
			for (i = a.length - 1; i >= 0; i -= 1) {
				n = a[i].name;
				if (typeof d[n] === 'function') {
					d[n] = null;
				}
			}
		}
		a = d.childNodes;
		if (a) {
			l = a.length;
			for (i = 0; i < l; i += 1) {
				__.purge(d.childNodes[i]);
			}
		}
	}
});

__.mixin({
	capitalize: function(str, lowercaseRest) {
		str = '' + str;
		var remainingChars = !lowercaseRest ? str.slice(1) : str.slice(1).toLowerCase();

		return str.charAt(0).toUpperCase() + remainingChars;
	}
});


function androidVersion() {
	var ua = navigator.userAgent;

	return parseFloat(ua.match(/Android\s+([\d\.]+)/)[1]);
}

function checkWebKit() {
	var result = /AppleWebKit\/([\d.]+)/.exec(navigator.userAgent);
	if (result) {
		return parseFloat(result[1]);
	}

	return null;
}

function getChromeVersion() {
	var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
	return raw ? parseInt(raw[2], 10) : false;
}

MHP1138.detector = (function(){
	var devicesType = ['desktop','mobile','tablet','tv'];
	var ready = false;
	var deviceType = null;
	var ua = null;
	var classList = [];
	var currentBrowser = {};
	var currentPlatform = {};
	var strings = {};

	var controller = {
		init: init,
		getBrowser: getBrowser,
		generateClassList: function(element){
			generateClassList(element);
		}
	};

	strings.os = {
		windows: /Windows NT\s+((\d+)\.(\d+))/i,
		macos:   /Mac OS X\s(\d+[\._](\d+)([\._]\d+)?)/i
	};

	strings.desktop = {
		ie:      /(?:WOW64.+rv:|MSIE\s)(\d+\.*\d*)(?!.*Firefox)/,         // https://regex101.com/r/iV6wT3/2
		chrome:  /(?:Chrome\/)(\d+\.\d+\.\d+\.*\d+)?/,                    // https://regex101.com/r/hG7aI5/2
		safari:  /(?:Version\/|Safari )(\d+\.\d+\.*\d*)/,                 // https://regex101.com/r/xA3nJ3/1
		firefox: /(?:[Ff]irefox(?:\/| |\(|)(\d*\.\d\.*\d*\.*\d*)*)/,      // https://regex101.com/r/xB2tR2/1
		opera:   /(?:Opera(?:\s|\/))(\d+\.*\d*)?/,					      // https://regex101.com/r/yO2pS0/1
		ios:     /iPhone|iPad|iPod/i,
		playstation: /playstation/i,
		xbox: /xbox/i
	};

	strings.mobile = {
		safari:  strings.desktop.safari,
		chrome:  /(?:CriOS\/|Chrome\/)(\d+\.\d+\.\d+\.*\d+)(?!.*OPR)/,    // https://regex101.com/r/qY1lR0/3
		opera:   /(?:OPR\/|Opera(?:\s|\/))(\d+\.\d+\.*\d*\.*\d*)/,        // https://regex101.com/r/cO9dX1/1
		firefox: /(?:Firefox|Fennec|FxiOS)(?:\/)((\d*\.\d\.*\d*\.*\d*))/, // https://regex101.com/r/xB2tR2/2
		ie:      /(?:(?:IEM|iem)obile|MSIE|Edge)(?:\/|\s)(\d+\.*\d*)/,    // https://regex101.com/r/mH9uM0/1
		uc:      /(?:UCBrowser\/|UCWEB\/)(\d+\.\d+\.*\d*\.*\d*)/,         // https://regex101.com/r/lF6lM7/1
		ios:     /iPhone|iPad|iPod/i,
		android: /Android/i,
		playstation: strings.desktop.playstation,
		xbox: strings.desktop.xbox
	};

	strings.tablet = {
		safari:  strings.desktop.safari,
		chrome:  strings.mobile.chrome,
		ios:     strings.mobile.ios,
		android: strings.mobile.android,
		firefox: strings.mobile.firefox,
		ie:      false,
		playstation: strings.desktop.playstation,
		xbox: strings.desktop.xbox
	};

	function init(device) {

		if( isValidType(device)) {
			deviceType = device;
			ua = navigator.userAgent;
		}
		//removeIf(production)
		else{
			MHP1138.error('The deviceType ("'+ device +'") that you passed to the loader is not valid!');
		}
		//endRemoveIf(production)

		createIsFunctions();
	}

	function createIsFunctions(){
		//Browser
		__.each( strings[deviceType], function(regex, browserName) {
			controller['is' + __.capitalize(browserName)] = function(){
				return !!ua.match(strings[deviceType][browserName]);
			};
		});

		// platforms
		__.each(strings.os, function(regex, osName) {
			controller['is' + __.capitalize(osName)] = function() {
				return !!ua.match(strings.os[osName]);
			};
		});

		//Devices type
		__.each( devicesType, function(deviceName){
			controller['is' + __.capitalize(deviceName)] = function(){
				return deviceName == deviceType;
			};
		});
	}

	function cleanVersion(version){
		return !__.isUndefined(version) ? version.replace('_','.').split('.')[0] : version;
	}

	function getBrowser(){
		if( __.isEmpty(currentBrowser) ){
			var detail = {};

			__.each( strings[deviceType], function(regex, browserName){
				if( controller['is' + __.capitalize(browserName)]() ){
					detail = [ browserName, ua.match(strings[deviceType][browserName])[1] ];
				}
			});

			currentBrowser = {
				name: detail[0],
				type: deviceType,
				version: cleanVersion(detail[1]),
				fullVersion: detail[1]
			};
		}

		return currentBrowser;
	}

	function generateClassList(element){
		var browser = getBrowser();

		if( !__.isUndefined(browser.name) )
			__.addClass(element, browser.name);

		if( !__.isUndefined(browser.type) )
			__.addClass(element, browser.type);

		if( !__.isUndefined(browser.version) )
			__.addClass(element, browser.name + browser.version);
	}

	function isValidType(type){
		return !!~__.indexOf(devicesType, type);
	}

	return controller;
})();
