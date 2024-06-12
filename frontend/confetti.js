window.ConfettiGenerator = function (params) {
  function getRandomValue(max, floor) {
    max = max || 1;
    var rand = Math.random() * max;
    return floor ? Math.floor(rand) : rand;
  }

  function createConfettiParticle() {
    return {
      x: getRandomValue(settings.width),
      y: getRandomValue(settings.height),
      radius: getRandomValue(4) + 2,
      color: settings.colors[getRandomValue(settings.colors.length, true)],
      speed: getRandomValue(settings.clock / 7) + settings.clock / 30,
    };
  }

  function drawConfettiParticle(particle) {
    var opacity = particle.radius <= 3 ? 0.4 : 0.8;
    context.fillStyle = "rgba(" + particle.color + ", " + opacity + ")";
    context.beginPath();
    context.arc(
      particle.x,
      particle.y,
      particle.radius * settings.size,
      0,
      2 * Math.PI,
      true
    );
    context.fill();
    context.lineWidth = 2 * settings.size;
    context.strokeStyle = "rgba(" + particle.color + ", 1)";
    context.stroke();
  }

  var settings = {
    target: "confetti-holder",
    max: 80,
    size: 1,
    animate: true,
    colors: [
      [165, 104, 246],
      [230, 61, 135],
      [0, 199, 228],
      [253, 214, 126],
    ],
    clock: 25,
    interval: null,
    width: window.innerWidth,
    height: window.innerHeight,
  };

  if (params) {
    Object.keys(params).forEach(function (key) {
      if (params[key] !== undefined && params[key] !== null) {
        settings[key] = params[key];
      }
    });
  }

  var canvas = document.getElementById(settings.target);
  var context = canvas.getContext("2d");
  var particles = [];

  return {
    render: function () {
      function animate() {
        context.clearRect(0, 0, settings.width, settings.height);
        particles.forEach(function (particle) {
          drawConfettiParticle(particle);
        });
        updateParticles();
      }

      function updateParticles() {
        particles.forEach(function (particle, index) {
          if (settings.animate) {
            particle.y += particle.speed;
          }
          if (particle.y > settings.height) {
            particles[index] = createConfettiParticle();
            particles[index].x = getRandomValue(settings.width, true);
            particles[index].y = -10;
          }
        });
      }

      canvas.width = settings.width;
      canvas.height = settings.height;
      particles = [];
      for (var i = 0; i < settings.max; i++) {
        particles.push(createConfettiParticle());
      }

      if (settings.animate) {
        settings.interval = setInterval(animate, 20);
      } else {
        animate();
      }
    },

    clear: function () {
      context.clearRect(0, 0, canvas.width, canvas.height);
      clearInterval(settings.interval);
    },
  };
};
