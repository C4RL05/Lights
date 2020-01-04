/**
 * Created by JetBrains WebStorm.
 * User: C4RL05
 * Date: 30/07/2011
 * Time: 15:13
 * To change this template use File | Settings | File Templates.
 */

LIGHTS.Vox = function( director ) {

	this.initialize( director );
};

LIGHTS.Vox.prototype = {

    // _______________________________________________________________________________________ Vars

    particleCount:      256,
	trailCountAdd:      24,
	trailCountAlpha:    24,
	spectrumLength:     64,

    // _______________________________________________________________________________________ Constructor

	initialize: function( director ) {

        this.director = director;
		this.player = director.player;
		this.targetPosition = this.player.targetPosition;

        this.vox = new THREE.Object3D();
        director.view.sceneVox.addChild( this.vox );

		this.voxPosition = this.vox.position;
		this.voxPositionY = 0;
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();

        this.createParticles();
		this.createTrails();
		this.createBengal();

		this.volume = 1;
		this.time = 0;
		this.isIntro = false;
		this.isOutro = false;
		this.active = false;
    },

    // _______________________________________________________________________________________ Update

	update: function() {

		if( this.active ) {

			var easing = LIGHTS.deltaTime * (this.player.velocity * this.player.turbo / 40);

			this.velocity.x = (this.targetPosition.x - this.position.x) * easing;
			this.velocity.y = (this.targetPosition.y - this.position.y) * easing;
			this.velocity.z = (this.targetPosition.z - this.position.z) * easing;

			this.position.x += this.velocity.x;
			this.position.y += this.velocity.y;
			this.position.z += this.velocity.z;

			this.voxPositionY -= ( this.voxPositionY - (this.player.cameraTilt + this.player.tilt) * 64 ) * easing * 0.5;
			this.voxPosition.x = this.position.x + this.player.right.x * this.player.roll * 128;
			this.voxPosition.y = this.position.y + this.voxPositionY;
			this.voxPosition.z = this.position.z + this.player.right.y * this.player.roll * 128;

			if( this.bengal.visible )
				this.updateBengal();

			if( this.isIntro ) {

				this.updateParticlesIntro();
			}
			else if( this.isOutro ) {

				this.updateParticlesOutro();
			}
			else {

				this.updateTrailPositions();
				this.updateTrailGeometry( this.trailGeometryAdd );
				this.updateTrailGeometry( this.trailGeometryAlpha );
			}
		}
    },

	finish: function() {

		this.lineSystem.visible = true;
		this.isOutro = true;

		this.bengalAlpha = 0;

		this.setupParticlesOutro();
//		this.trailSystemAdd.visible = false;
//		this.trailSystemAlpha.visible = false;
//		this.bengal.visible = false;
//		this.bengalShadow.visible = false;
	},

	stop: function() {

		this.lineSystem.visible = false;
		this.trailSystemAdd.visible = false;
		this.trailSystemAlpha.visible = false;
		this.bengal.visible = false;
		this.bengalShadow.visible = false;
		this.active = false;

	},

	start: function() {

		this.active = true;
		this.lineSystem.visible = true;
		this.trailSystemAdd.visible = false;
		this.trailSystemAlpha.visible = false;
		this.bengal.visible = false;
		this.bengalShadow.visible = false;
		this.position.copy( this.director.player.targetPosition );
		this.isIntro = true;
		this.isOutro = false;
		this.introTime = 0;
		this.bengalMaterialCache.visible = true;

		this.setupParticlesIntro();
	},

	launchBengal: function() {

		this.bengal.visible = true;
		this.bengalShadow.visible = true;

		this.bengalTime = 0;
		this.bengalAlpha = 0;
		this.bengal.scale.x = this.bengal.scale.y = 0.001;
		this.bengalShadow.scale.x = this.bengalShadow.scale.y = this.bengal.scale.x;
	},

	launch: function() {

		if( LIGHTS.Music.startTime > 0 )
			this.launchBengal();

		this.isIntro = false;
		this.lineSystem.visible = false;
		this.trailSystemAdd.visible = true;
		this.trailSystemAlpha.visible = true;

		this.setupTrailGeometry( this.trailGeometryAdd );
		this.setupTrailGeometry( this.trailGeometryAlpha );
		this.setupTrailPositions();

		this.bengalMaterialCache.visible = false;
	},

    // _______________________________________________________________________________________ Trails

	createTrails: function() {

		var scene = this.director.view.sceneVox,
			material, i, il;

		var texture = new THREE.Texture( LIGHTS.images.spotLine );
		texture.needsUpdate = true;

		// Add
		this.trailGeometryAdd = new LIGHTS.SpotGeometry( 10, 10, 64, 64, this.trailCountAdd );
		this.trailGeometryAdd.computeBoundingSphere();
		this.trailGeometryAdd.boundingSphere.radius = Number.MAX_VALUE;
		this.trailGeometryAdd.trailCount = this.trailCountAdd;

		for( i = 0, il = this.trailGeometryAdd.vertices.length; i < il; i++ )
			this.trailGeometryAdd.vertices[ i ].linePosition = new THREE.Vector3();

//		i = this.trailGeometryAdd.vertices.length / this.trailCountAdd;

		material = new THREE.MeshBasicMaterial( {

			map:            texture,
//			color:          0x202020,
			blending:       THREE.AdditiveBlending,
			transparent:    true
		} );

		this.trailSystemAdd = new THREE.Mesh( this.trailGeometryAdd, material );
		this.trailSystemAdd.renderDepth = 0;
		this.trailSystemAdd.dynamic = true;
		this.trailSystemAdd.doubleSided = true;
		scene.addChild( this.trailSystemAdd );

		// Lines
		this.trailGeometryAdd.trailDatas = [];

		for( i = 0, il = this.trailCountAdd; i < il; i++ )
			this.trailGeometryAdd.trailDatas.push( this.createTrailData( 3 ) );

		// Color
		texture = new THREE.Texture( LIGHTS.images.spotLineAlpha );
		texture.needsUpdate = true;

		this.trailGeometryAlpha = new LIGHTS.SpotGeometry( 10, 10, 64, 64, this.trailCountAlpha );
		this.trailGeometryAlpha.computeBoundingSphere();
		this.trailGeometryAlpha.boundingSphere.radius = Number.MAX_VALUE;
		this.trailGeometryAlpha.trailCount = this.trailCountAdd;

		for( i = 0, il = this.trailGeometryAlpha.vertices.length; i < il; i++ )
			this.trailGeometryAlpha.vertices[ i ].linePosition = new THREE.Vector3();

		this.setupTrailVertexColors( this.trailGeometryAlpha );

		material = new THREE.MeshBasicMaterial( {

			vertexColors:   THREE.VertexColors,
			map:            texture,
			opacity:        0.75,
//			blending:       THREE.AdditiveBlending,
			transparent:    true
		} );

		this.trailSystemAlpha = new THREE.Mesh( this.trailGeometryAlpha, material );
		this.trailSystemAlpha.renderDepth = 20;
		this.trailSystemAlpha.dynamic = true;
		this.trailSystemAlpha.doubleSided = true;
		scene.addChild( this.trailSystemAlpha );

		// Lines
		this.trailGeometryAlpha.trailDatas = [];

		for( i = 0, il = this.trailCountAlpha; i < il; i++ )
			this.trailGeometryAlpha.trailDatas.push( this.createTrailData( 6 ) );

		// Trail
		this.trailPositions = [];

		for( i = 0; i <= 70; i++ )
			this.trailPositions[ i ] = new THREE.Vector3();

		// Spectrum
		this.spectrum = [];

		for( i = 0; i < this.spectrumLength; i++ )
			this.spectrum[ i ] = 0;

		this.spectrumIndex = 0;

	},

	setupTrailVertexColors: function( geometry ) {

		var trailCount = geometry.trailCount,
			faces = geometry.faces,
			faceCount = faces.length,
			planeOffset = faceCount / trailCount,
			colorTop = [ 1, 0, 0 ],
			colorBottom = [ 1, 0, 0 ],
			f = 0,
			i, j, color, alpha, alphaMinus;

		for( i = 0; i < trailCount; i++ ) {

			colorBottom[ 1 ] = Math.random() * 0.5 + 0.5;
			colorBottom[ 2 ] = Math.random() * 0.5;

			colorTop[ 1 ] = Math.random() * 0.5 + 0.5;
			colorTop[ 2 ] = Math.random() * 0.5;

			for( j = 0; j < planeOffset; j++ ) {

				face = faces[ f++ ];

				alpha = j / planeOffset;
				alphaMinus = 1 - alpha;
				color = new THREE.Color();
				color.r = alphaMinus * colorBottom[ 0 ] + alpha * colorTop[ 0 ];
				color.g = alphaMinus * colorBottom[ 1 ] + alpha * colorTop[ 1 ];
				color.b = alphaMinus * colorBottom[ 2 ] + alpha * colorTop[ 2 ];

				face.vertexColors.push( color );
				face.vertexColors.push( color );

				alpha = (j + 1) / planeOffset;
				alphaMinus = 1 - alpha;
				color = new THREE.Color();
				color.r = alphaMinus * colorBottom[ 0 ] + alpha * colorTop[ 0 ];
				color.g = alphaMinus * colorBottom[ 1 ] + alpha * colorTop[ 1 ];
				color.b = alphaMinus * colorBottom[ 2 ] + alpha * colorTop[ 2 ];

				face.vertexColors.push( color );
				face.vertexColors.push( color );
			}
		}

		geometry.__dirtyColors = true;
	},

	setupTrailGeometry: function( geometry ) {

		var vertices = geometry.vertices,
			vertexCount = vertices.length,
			v, pos;

		for( v = 0; v < vertexCount; v++ ) {

			pos = vertices[ v ].linePosition;
			pos.x = 0;
			pos.y = 0;
			pos.z = 0;
		}

		geometry.__dirtyVertices = true;
	},

	setupTrailPositions: function() {

		var trail = this.trailPositions,
			posX = this.voxPosition.x,
			posY = this.voxPosition.y,
			posZ = this.voxPosition.z,
			i, il, pos;

		for( i = 0, il = trail.length; i < il; i++ ) {

			pos = trail[ i ];
			pos.x = posX;
			pos.y = posY;
			pos.z = posZ;
			pos.active = false;
		}
	},

	updateTrailPositions: function() {

		var thisPos = this.voxPosition,
			pos = this.trailPositions.pop();

		pos.x = thisPos.x;
		pos.y = thisPos.y;
		pos.z = thisPos.z;
		pos.active = true;

		this.trailPositions.unshift( pos );

		this.time += LIGHTS.deltaTime;
	},

	createTrailData: function( headNoise ) {

		return {

			offset:             Math.random() * rad360,
			offsetZ:            Math.random() * rad360,
			freq:               rad180 * (Math.random() * 2 + 0.5),
			amp:                (Math.random() - 0.5) * 10,
			rows:               Math.floor( Math.random() * 8 ) + 4,
			spectrumOffset:     Math.floor( Math.random() * 64 ),
			head:               [ (Math.random() - 0.5) * headNoise,
								  (Math.random() - 0.5) * headNoise,
								  (Math.random() - 0.5) * headNoise ] };
	},

	updateTrailGeometry: function( geometry ) {

		var lineBodyRnd = 0.1; //0.5 * (this.volume + 1);

		var time = this.time,
			spectrum = this.spectrum,
			spectrumLength = this.spectrumLength,
			trailPositions = this.trailPositions,
			trailDatas = geometry.trailDatas,
			trailCount = geometry.trailCount,
			posX = this.voxPosition.x,
			posY = this.voxPosition.y,
			posZ = this.voxPosition.z,
			vertices = geometry.vertices,
			vertexCount = vertices.length,
			planeOffset = vertexCount / trailCount,
			v, l, vertex, pos, linePos, a, index, head, spectrumIndex, spectrumRnd, data, offset, freq, amp;

		// Shift positions
		for( v = planeOffset - 1; v > 2; v -= 2 ) {

			for( l = 0; l < trailCount; l++ ) {

				vertex = v + l * planeOffset;

				pos = vertices[ vertex ].linePosition;
				linePos = vertices[ vertex - 2 ].linePosition;
				pos.x = linePos.x;
				pos.y = linePos.y;
				pos.z = linePos.z;

				pos = vertices[ vertex - 1 ].linePosition;
				linePos = vertices[ vertex - 3 ].linePosition;
				pos.x = linePos.x;
				pos.y = linePos.y;
				pos.z = linePos.z;
			}
		}

		// Head
		for( l = 0; l < trailCount; l++ ) {

			vertex = planeOffset * l;

			data = trailDatas[ l ];
			amp = data.amp;
			freq = data.freq;
			offset = data.offset;
			head = data.head;

			a = time * freq + offset;

			linePos = vertices[ vertex ].linePosition;
			linePos.x = amp * Math.sin( a );
			linePos.y = amp * Math.cos( a );
			linePos.z = amp * Math.sin( a + data.offsetZ );

			pos = vertices[ vertex + 1 ].linePosition;
			pos.x = linePos.x + head[ 0 ];
			pos.y = linePos.y + head[ 1 ];
			pos.z = linePos.z + head[ 2 ];
		}

		// Body
		this.spectrumIndex += LIGHTS.deltaTime * 10;
		spectrumIndex = Math.floor( this.spectrumIndex );

		for( v = 0; v < vertexCount; v += 2 ) {

			data = trailDatas[ Math.floor( v / planeOffset ) ];
			spectrumRnd = spectrum[ ((v % planeOffset) + spectrumIndex + data.spectrumOffset) % spectrumLength ];
			freq = data.freq;
			offset = data.offset;

			var row = (v/2) % (planeOffset/2);
			var trailPos = trailPositions[ row ];
			amp = Math.sin( Math.min( row / 16, 1 ) * rad90 ) * (0.15 + spectrumRnd * 0.005) * this.volume + 0.1;

			if( trailPos.active ) {

				pos = vertices[ v ].position;
				linePos = vertices[ v ].linePosition;
				pos.x = trailPos.x + linePos.x * amp;
				pos.y = trailPos.y + linePos.y * amp;
				pos.z = trailPos.z + linePos.z * amp;

				pos = vertices[ v + 1 ].position;
				linePos = vertices[ v + 1 ].linePosition;
				pos.x = trailPos.x + linePos.x * amp;
				pos.y = trailPos.y + linePos.y * amp;
				pos.z = trailPos.z + linePos.z * amp;
			}
			else {

				pos = vertices[ v ].position;
				pos.x = posX;
				pos.y = posY;
				pos.z = posZ;

				pos = vertices[ v + 1 ].position;
				pos.x = posX;
				pos.y = posY;
				pos.z = posZ;
			}
		}

		geometry.__dirtyVertices = true;
	},

    // _______________________________________________________________________________________ Bengal

	createBengal: function() {

		this.bengalIndex = 0;
		this.bengalTexture = new THREE.Texture( LIGHTS.images.bengalSeq );
		this.bengalTexture.repeat.x = this.bengalTexture.repeat.y = 0.25;
		this.bengalTexture.needsUpdate = true;

		var material = new THREE.MeshBasicMaterial( {

			map:            this.bengalTexture,
			blending:       THREE.AdditiveBlending,
			transparent:    true,
			depthTest:      false
		} );

		this.bengal = new THREE.Mesh( new THREE.PlaneGeometry( 20, 20 ), material );
		this.bengal.doubleSided = true;
		this.bengal.renderDepth = 10;
		this.director.view.sceneVox.addChild( this.bengal );

		this.bengalPosition = this.bengal.position;

		// Shadow
		var texture = new THREE.Texture( LIGHTS.images.bengalShadow );
		texture.needsUpdate = true;

		material = new THREE.MeshBasicMaterial( {

			map:            texture,
			blending:       THREE.MultiplyBlending,
			transparent:    true
		} );

		this.bengalShadow = new THREE.Mesh( new THREE.PlaneGeometry( 20, 20 ), material );
		this.bengalShadow.doubleSided = true;
		this.bengalShadow.renderDepth = 40;
		this.director.view.sceneVox.addChild( this.bengalShadow );

		// Cache material
		this.bengalMaterialCache = new THREE.Mesh( new THREE.PlaneGeometry( 0, 0 ), material );
		this.bengalMaterialCache.doubleSided = true;
		this.vox.addChild( this.bengalMaterialCache );
	},

	updateBengal: function() {

		var deltaTime = LIGHTS.deltaTime;

		// Anim texture
		this.bengalTime += deltaTime;

		if( this.bengalTime >= 1/30 ) {

			this.bengalTime -= 1/30;
			this.bengalIndex++;

			if( this.bengalIndex >= 16 )
				this.bengalIndex = 0;

			this.bengalTexture.offset.x = (this.bengalIndex % 4) * 0.25;
			this.bengalTexture.offset.y = Math.floor( this.bengalIndex / 4 ) * 0.25;
		}

		// Scale
		if( this.bengalAlpha < 1 ) {

			this.bengalAlpha += deltaTime;

			if( this.isIntro ) {

				this.bengal.scale.x -= ( this.bengal.scale.x - 1 ) * deltaTime * 4;
			}
			else if( this.isOutro  && this.bengal.scale.x > 0 ) {

				this.bengal.scale.x = Math.max( 0.001, this.bengal.scale.x - deltaTime * 2 );
				this.bengalShadow.scale.x = this.bengalShadow.scale.y = this.bengal.scale.x;
			}

			this.bengal.scale.y = this.bengal.scale.x;
		}
		else if( ! this.isOutro ) {

			this.bengal.scale.x = this.bengal.scale.y = 0.25 + 0.5 * this.volume;
		}

		this.bengalShadow.scale.x = this.bengalShadow.scale.y = this.bengal.scale.x;

		// Position + rotation
		this.bengalPosition.x = this.voxPosition.x;
		this.bengalPosition.y = this.voxPosition.y;
		this.bengalPosition.z = this.voxPosition.z;
		this.bengal.lookAt( this.director.view.camera.position );

		this.bengalShadow.position.x = this.voxPosition.x;
		this.bengalShadow.position.y = this.voxPosition.y;
		this.bengalShadow.position.z = this.voxPosition.z;
		this.bengalShadow.lookAt( this.director.view.camera.position );
	},

    // _______________________________________________________________________________________ Particles

	createParticles: function() {

	    var p, pl, particle, vertices, particles;

	    // Geometry
	    this.particleGeometry = new THREE.Geometry();
		vertices = this.particleGeometry.vertices;
	    particles = this.particles = [];

	    // Particles
	    for( p = 0, pl = this.particleCount; p < pl; p++ ) {

	        particle = new LIGHTS.VoxParticle();

	        vertices.push( new THREE.Vertex( particle.positionStart ) );
	        vertices.push( new THREE.Vertex( particle.positionEnd ) );
	        particles.push( particle );
	    }

	    // Material
		this.lineMaterial = new THREE.LineBasicMaterial( {

			color:          0xFF8040,
			linewidth:      1,
			blending:       THREE.AdditiveBlending,
			transparent:    true,
			depthTest:      false
		} );

		// Line System
		this.lineSystem = new THREE.Line( this.particleGeometry, this.lineMaterial, THREE.LinePieces );
		this.lineSystem.dynamic = true;
		this.lineSystem.visible = false;
	    this.director.view.scene.addChild( this.lineSystem );
	},

	setupParticlesIntro: function() {

		var particles = this.particles,
			positionX = this.voxPosition.x,
			positionY = this.voxPosition.y,
			positionZ = this.voxPosition.z,
			u, a, r, s, p, pl, particle, pos, normal;

		for( p = 0, pl = this.particleCount; p < pl; p++ ) {

			particle = particles[ p ];

			u = Math.random() * 2 - 1;
			a = Math.random() * rad360;
			r = Math.sqrt( 1 - u * u );

			normal = particle.normal;
			normal.x = Math.cos( a ) * r;
			normal.y = Math.sin( a ) * r;
			normal.z = u;

			s = Math.random() * 50 + 100;

			pos = particle.positionStart;
			pos.x = positionX + normal.x * s;
			pos.y = positionY + normal.y * s;
			pos.z = positionZ + normal.z * s;

			pos = particle.positionEnd;
			pos.x = positionX + normal.x * s;
			pos.y = positionY + normal.y * s;
			pos.z = positionZ + normal.z * s;

			particle.end = particle.start = s;
			particle.startVelocity = Math.random() * s * 0.5 + s;
			particle.endVelocity = Math.random() * s * 0.5 + s;
		}

		this.particleGeometry.__dirtyVertices = true;

		this.lineMaterial.color.setHex( 0xFF8040 );

		this.introTime = 0;
	},

	updateParticlesIntro: function() {

		var deltaTime = LIGHTS.deltaTime,
			particles = this.particles,
			positionX = this.voxPosition.x,
			positionY = this.voxPosition.y,
			positionZ = this.voxPosition.z,
			p, pl, particle, pos, normal, radius;

		for( p = 0, pl = this.particleCount; p < pl; p++ ) {

			particle = particles[ p ];

			particle.start = Math.max( 0, particle.start - deltaTime * particle.startVelocity );
			particle.end = Math.max( 0, particle.end - deltaTime * particle.endVelocity );

			normal = particle.normal;

			radius = particle.start;
			pos = particle.positionStart;
			pos.x = positionX + normal.x * radius;
			pos.y = positionY + normal.y * radius;
			pos.z = positionZ + normal.z * radius;

			radius = particle.end;
			pos = particle.positionEnd;
			pos.x = positionX + normal.x * radius;
			pos.y = positionY + normal.y * radius;
			pos.z = positionZ + normal.z * radius;
		}

		this.particleGeometry.__dirtyVertices = true;

		this.introTime += deltaTime;

		if( this.introTime > 0.75 && ! this.bengal.visible )
			this.launchBengal();
	},

	setupParticlesOutro: function() {

		var particles = this.particles,
			positionX = this.voxPosition.x,
			positionY = this.voxPosition.y,
			positionZ = this.voxPosition.z,
			p, pl, particle, pos;

		for( p = 0, pl = this.particleCount; p < pl; p++ ) {

			particle = particles[ p ];

			pos = particle.positionStart;
			pos.x = positionX;
			pos.y = positionY;
			pos.z = positionZ;

			pos = particle.positionEnd;
			pos.x = positionX;
			pos.y = positionY;
			pos.z = positionZ;

			particle.end = particle.start = 50 - Math.random() * 100;
		}

		this.particleGeometry.__dirtyVertices = true;

		this.outroTime = 0;
	},

	updateParticlesOutro: function() {

		var deltaTime = LIGHTS.deltaTime,
			particles = this.particles,
			positionX = this.voxPosition.x,
			positionY = this.voxPosition.y,
			positionZ = this.voxPosition.z,
			p, pl, particle, pos, normal, radius, color, dark;

		for( p = 0, pl = this.particleCount; p < pl; p++ ) {

			particle = particles[ p ];

			particle.start += deltaTime * particle.startVelocity;
			particle.end += deltaTime * particle.endVelocity;

			if( particle.start > 0 && particle.end > 0 ) {

				normal = particle.normal;

				radius = particle.start;
				pos = particle.positionStart;
				pos.x = positionX + normal.x * radius;
				pos.y = positionY + normal.y * radius;
				pos.z = positionZ + normal.z * radius;

				radius = particle.end;
				pos = particle.positionEnd;
				pos.x = positionX + normal.x * radius;
				pos.y = positionY + normal.y * radius;
				pos.z = positionZ + normal.z * radius;
			}
		}

		this.particleGeometry.__dirtyVertices = true;

		this.outroTime += deltaTime;

		if( this.outroTime > 1 ) {

			color = this.lineMaterial.color;
			dark = 1 - deltaTime * 4;
			color.r *= dark;
			color.g *= dark;
			color.b *= dark;

			if( this.outroTime > 1.7 )
				this.stop();
		}
	}
};

LIGHTS.VoxParticle = function() {

    this.positionStart = new THREE.Vector3();
    this.positionEnd = new THREE.Vector3();
	this.normal = new THREE.Vector3();
};


/*
var vs = [-0.6636053, -5.478144, -0.3831328, -0.3831328, -5.478144, -0.6636053, 0, -5.478144, -0.7662655, 0.3831328, -5.478144, -0.6636053, 0.6636053, -5.478144, -0.3831328, 0.7662655, -5.478144, 0, 0.6636053, -5.478144, 0.3831328, 0.3831328, -5.478144, 0.6636053, 0, -5.478144, 0.7662655, -0.3831328, -5.478144, 0.6636053, -0.6636053, -5.478144, 0.3831328, -0.7662655, -5.478144, 0, -0.318938, -5.07377, -0.1841387, -0.1841387, -5.07377, -0.318938, 0, -5.07377, -0.3682775, 0.1841387, -5.07377, -0.318938, 0.318938, -5.07377, -0.1841387, 0.3682775, -5.07377, 0, 0.318938, -5.07377, 0.1841387, 0.1841387, -5.07377, 0.318938, 0, -5.07377, 0.3682775, -0.1841387, -5.07377, 0.318938, -0.318938, -5.07377, 0.1841387, -0.3682775, -5.07377, 0, -0.1413497, -4.691051, -0.08160831, -0.08160831, -4.691051, -0.1413497, 0, -4.691051, -0.1632166, 0.08160831, -4.691051, -0.1413497, 0.1413497, -4.691051, -0.08160831, 0.1632166, -4.691051, 0, 0.1413497, -4.691051, 0.08160831, 0.08160831, -4.691051, 0.1413497, 0, -4.691051, 0.1632166, -0.08160831, -4.691051, 0.1413497, -0.1413497, -4.691051, 0.08160831, -0.1632166, -4.691051, 0, -0.05908209, -4.24158, -0.03411123, -0.03411123, -4.24158, -0.05908209, 0, -4.24158, -0.06822246, 0.03411123, -4.24158, -0.05908209, 0.05908209, -4.24158, -0.03411123, 0.06822246, -4.24158, 0, 0.05908209, -4.24158, 0.03411123, 0.03411123, -4.24158, 0.05908209, 0, -4.24158, 0.06822246, -0.03411123, -4.24158, 0.05908209, -0.05908209, -4.24158, 0.03411123, -0.06822246, -4.24158, 0, -0.05801314, -2.686576, -0.03349382, -0.03349382, -2.686576, -0.05801314, 0, -2.686576, -0.06698763, 0.03349382, -2.686576, -0.05801314, 0.05801314, -2.686576, -0.03349382, 0.06698763, -2.686576, 0, 0.05801314, -2.686576, 0.03349382, 0.03349382, -2.686576, 0.05801314, 0, -2.686576, 0.06698763, -0.03349382, -2.686576, 0.05801314, -0.05801314, -2.686576, 0.03349382, -0.06698763, -2.686576, 0, -0.09132248, -1.885502, -0.05272526, -0.05272526, -1.885502, -0.09132248, 0, -1.885502, -0.1054505, 0.05272526, -1.885502, -0.09132248, 0.09132248, -1.885502, -0.05272526, 0.1054505, -1.885502, 0, 0.09132248, -1.885502, 0.05272526, 0.05272526, -1.885502, 0.09132248, 0, -1.885502, 0.1054505, -0.05272526, -1.885502, 0.09132248, -0.09132248, -1.885502, 0.05272526, -0.1054505, -1.885502, 0, -0.3026648, -1.103645, -0.1747438, -0.1747438, -1.103645, -0.3026648, 0, -1.103645, -0.3494877, 0.1747438, -1.103645, -0.3026648, 0.3026648, -1.103645, -0.1747438, 0.3494877, -1.103645, 0, 0.3026648, -1.103645, 0.1747438, 0.1747438, -1.103645, 0.3026648, 0, -1.103645, 0.3494877, -0.1747438, -1.103645, 0.3026648, -0.3026648, -1.103645, 0.1747438, -0.3494877, -1.103645, 0, -0.4618769, -0.8792522, -0.2666648, -0.2666648, -0.8792522, -0.4618769, 0, -0.8792522, -0.5333297, 0.2666648, -0.8792522, -0.4618769, 0.4618769, -0.8792522, -0.2666648, 0.5333297, -0.8792522, 0, 0.4618769, -0.8792522, 0.2666648, 0.2666648, -0.8792522, 0.4618769, 0, -0.8792522, 0.5333297, -0.2666648, -0.8792522, 0.4618769, -0.4618769, -0.8792522, 0.2666648, -0.5333297, -0.8792522, 0, -0.1686042, -1.457074, 0.09734389, -0.09734389, -1.457074, 0.1686042, 0, -1.457074, 0.1946878, 0.09734389, -1.457074, 0.1686042, 0.1686042, -1.457074, 0.09734389, 0.1946878, -1.457074, 0, 0.1686042, -1.457074, -0.09734389, 0.09734389, -1.457074, -0.1686042, 0, -1.457074, -0.1946878, -0.09734389, -1.457074, -0.1686042, -0.1686042, -1.457074, -0.09734389, -0.1946878, -1.457074, 0, -0.6123724, -0.7001067, -0.3535534, -0.3535534, -0.7001067, -0.6123724, 0, -0.7001067, -0.7071068, 0.3535534, -0.7001067, -0.6123724, 0.6123724, -0.7001067, -0.3535534, 0.7071068, -0.7001067, 0, 0.6123724, -0.7001067, 0.3535534, 0.3535534, -0.7001067, 0.6123724, 0, -0.7001067, 0.7071068, -0.3535534, -0.7001067, 0.6123724, -0.6123724, -0.7001067, 0.3535534, -0.7071068, -0.7001067, 0, -0.75, -0.493, -0.4330127, -0.4330127, -0.493, -0.75, 0, -0.493, -0.8660254, 0.4330127, -0.493, -0.75, 0.75, -0.493, -0.4330127, 0.8660254, -0.493, 0, 0.75, -0.493, 0.4330127, 0.4330127, -0.493, 0.75, 0, -0.493, 0.8660254, -0.4330127, -0.493, 0.75, -0.75, -0.493, 0.4330127, -0.8660254, -0.493, 0, -0.8365163, -0.2518191, -0.4829629, -0.4829629, -0.2518191, -0.8365163, 0, -0.2518191, -0.9659258, 0.4829629, -0.2518191, -0.8365163, 0.8365163, -0.2518191, -0.4829629, 0.9659258, -0.2518191, 0, 0.8365163, -0.2518191, 0.4829629, 0.4829629, -0.2518191, 0.8365163, 0, -0.2518191, 0.9659258, -0.4829629, -0.2518191, 0.8365163, -0.8365163, -0.2518191, 0.4829629, -0.9659258, -0.2518191, 0, -0.8660254, 0.007, -0.5, -0.5, 0.007, -0.8660254, 0, 0.007, -1, 0.5, 0.007, -0.8660254, 0.8660254, 0.007, -0.5, 1, 0.007, 0, 0.8660254, 0.007, 0.5, 0.5, 0.007, 0.8660254, 0, 0.007, 1, -0.5, 0.007, 0.8660254, -0.8660254, 0.007, 0.5, -1, 0.007, 0, -0.8365163, 0.2658191, -0.4829629, -0.4829629, 0.2658191, -0.8365163, 0, 0.2658191, -0.9659258, 0.4829629, 0.2658191, -0.8365163, 0.8365163, 0.2658191, -0.4829629, 0.9659258, 0.2658191, 0, 0.8365163, 0.2658191, 0.4829629, 0.4829629, 0.2658191, 0.8365163, 0, 0.2658191, 0.9659258, -0.4829629, 0.2658191, 0.8365163, -0.8365163, 0.2658191, 0.4829629, -0.9659258, 0.2658191, 0, -0.75, 0.507, -0.4330127, -0.4330127, 0.507, -0.75, 0, 0.507, -0.8660254, 0.4330127, 0.507, -0.75, 0.75, 0.507, -0.4330127, 0.8660254, 0.507, 0, 0.75, 0.507, 0.4330127, 0.4330127, 0.507, 0.75, 0, 0.507, 0.8660254, -0.4330127, 0.507, 0.75, -0.75, 0.507, 0.4330127, -0.8660254, 0.507, 0, -0.6123724, 0.7141068, -0.3535534, -0.3535534, 0.7141068, -0.6123724, 0, 0.7141068, -0.7071068, 0.3535534, 0.7141068, -0.6123724, 0.6123724, 0.7141068, -0.3535534, 0.7071068, 0.7141068, 0, 0.6123724, 0.7141068, 0.3535534, 0.3535534, 0.7141068, 0.6123724, 0, 0.7141068, 0.7071068, -0.3535534, 0.7141068, 0.6123724, -0.6123724, 0.7141068, 0.3535534, -0.7071068, 0.7141068, 0, -0.4330127, 0.8730254, -0.25, -0.25, 0.8730254, -0.4330127, 0, 0.8730254, -0.5, 0.25, 0.8730254, -0.4330127, 0.4330127, 0.8730254, -0.25, 0.5, 0.8730254, 0, 0.4330127, 0.8730254, 0.25, 0.25, 0.8730254, 0.4330127, 0, 0.8730254, 0.5, -0.25, 0.8730254, 0.4330127, -0.4330127, 0.8730254, 0.25, -0.5, 0.8730254, 0, -0.2241439, 0.9729258, -0.1294095, -0.1294095, 0.9729258, -0.2241439, 0, 0.9729258, -0.258819, 0.1294095, 0.9729258, -0.2241439, 0.2241439, 0.9729258, -0.1294095, 0.258819, 0.9729258, 0, 0.2241439, 0.9729258, 0.1294095, 0.1294095, 0.9729258, 0.2241439, 0, 0.9729258, 0.258819, -0.1294095, 0.9729258, 0.2241439, -0.2241439, 0.9729258, 0.1294095, -0.258819, 0.9729258, 0, 0, 1.007, 0, -0.9387715, -6.245, -0.542, -0.542, -6.245, -0.9387715, 0, -6.245, -1.084, 0.542, -6.245, -0.9387715, 0.9387715, -6.245, -0.542, 1.084, -6.245, 0, 0.9387715, -6.245, 0.542, 0.542, -6.245, 0.9387715, 0, -6.245, 1.084, -0.542, -6.245, 0.9387715, -0.9387715, -6.245, 0.542, -1.084, -6.245, 0, -0.9067836, -5.96444, -0.5235318, -0.5235318, -5.96444, -0.9067836, 0, -5.96444, -1.047064, 0.5235318, -5.96444, -0.9067836, 0.9067836, -5.96444, -0.5235318, 1.047064, -5.96444, 0, 0.9067836, -5.96444, 0.5235318, 0.5235318, -5.96444, 0.9067836, 0, -5.96444, 1.047064, -0.5235318, -5.96444, 0.9067836, -0.9067836, -5.96444, 0.5235318, -1.047064, -5.96444, 0, -0.813, -5.703, -0.4693858, -0.4693858, -5.703, -0.813, 0, -5.703, -0.9387716, 0.4693858, -5.703, -0.813, 0.813, -5.703, -0.4693858, 0.9387716, -5.703, 0, 0.813, -5.703, 0.4693858, 0.4693858, -5.703, 0.813, 0, -5.703, 0.9387716, -0.4693858, -5.703, 0.813, -0.813, -5.703, 0.4693858, -0.9387716, -5.703, 0, 0, -5.478144, -0.7662655, 0, -5.07377, -0.3682775, 0, -4.691051, -0.1632166, 0, -4.24158, -0.06822246, 0, -2.686576, -0.06698763, 0, -1.885502, -0.1054505, 0, -1.457074, -0.1946878, 0, -1.103645, -0.3494877, 0, -0.8792522, -0.5333297, -0.4618769, -0.8792522, -0.2666648, -0.2666648, -0.8792522, -0.4618769, 0, -0.8792522, -0.5333297, 0.2666648, -0.8792522, -0.4618769, 0.4618769, -0.8792522, -0.2666648, 0.5333297, -0.8792522, 0, 0.4618769, -0.8792522, 0.2666648, 0.2666648, -0.8792522, 0.4618769, 0, -0.8792522, 0.5333297, -0.2666648, -0.8792522, 0.4618769, -0.4618769, -0.8792522, 0.2666648, -0.5333297, -0.8792522, 0, -0.6123724, -0.7001067, -0.3535534, -0.4618769, -0.8792522, -0.2666648, -0.75, -0.493, -0.4330127, -0.8365163, -0.2518191, -0.4829629, -0.8660254, 0.007, -0.5, -0.8365163, 0.2658191, -0.4829629, -0.75, 0.507, -0.4330127, -0.6123724, 0.7141068, -0.3535534, -0.4330127, 0.8730254, -0.25, -0.2241439, 0.9729258, -0.1294095, 0, 1.007, 0, 0, 1.007, 0, 0, 1.007, 0, 0, 1.007, 0, 0, 1.007, 0, 0, 1.007, 0, 0, 1.007, 0, 0, 1.007, 0, 0, 1.007, 0, 0, 1.007, 0, 0, 1.007, 0, -0.9067836, -5.96444, -0.5235318, -0.9387715, -6.245, -0.542, -0.813, -5.703, -0.4693858, -0.3831328, -5.478144, -0.6636053, -0.6636053, -5.478144, -0.3831328, 0, -5.478144, -0.7662655, 0.3831328, -5.478144, -0.6636053, 0.6636053, -5.478144, -0.3831328, 0.7662655, -5.478144, 0, 0.6636053, -5.478144, 0.3831328, 0.3831328, -5.478144, 0.6636053, 0, -5.478144, 0.7662655, -0.3831328, -5.478144, 0.6636053, -0.6636053, -5.478144, 0.3831328, -0.7662655, -5.478144, 0, -0.6636053, -5.478144, -0.3831328 ];

var refVerts = [];
for( i = 0, il = vs.length; i < il; i += 3 )
	refVerts.push( new THREE.Vector3( vs[ i ], vs[ i+1 ], vs[ i+2 ] ));


var yList = [];
var oList = [];

for( i = 0, il = refVerts.length; i < il; i++ ) {
//		for( i = 0, il = vertices.length; i < il; i++ ) {

	pos = refVerts[ i ];
//			pos = vertices[ i ].position;

	if(  yList.indexOf( pos.y ) == -1 ) {
//			if( pos.y <= rangeMax && yList.indexOf( pos.y ) == -1 )
		yList.push( pos.y );
		oList.push( { y: pos.y, r: Math.sqrt( pos.x * pos.x + pos.z * pos.z ) } );
	}

	if( pos.y > rangeMax && pos.y < radiusY ) {

		radiusY = Math.min( pos.y, radiusY );
		radiusMax = Math.sqrt( pos.x * pos.x + pos.z * pos.z );
	}
}

oList.sort( function sort( a, b ) { return b.y - a.y; } );
lastIndex = yList.length - 1;

var output = "";
for( i = 0; i < oList.length; i++ )
	output += "{ y: " + oList[ i ].y + ", r: " + oList[ i ].r + " }, ";

console.log( output)
*/